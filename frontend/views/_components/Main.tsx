import { useEffect, useRef, useState } from 'react';
import { Editor } from './Editor';
import { Alert } from './Alert';
import { PrinterIcon, SaveIcon, TrashIcon } from 'lucide-react';
import type { PageProps } from '../index';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

interface MainProps {
  note: PageProps['notes'][number] | null;
}

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';')?.shift();
}

export function Main({ note }: MainProps) {
  const [content, setContent] = useState(note?.body);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const swrConfig = useSWRConfig();
  const mutate = swrConfig.mutate.bind(null, '/api/notes');

  useEffect(() => {
    if (!note) return;
    setContent(note.body);
  }, [note]);

  function printHandler() {
    const element = titleRef.current;
    if (!element) return;

    const title = element.textContent;
    if (!title) {
      toast.error('Title should not be empty');
      return;
    }

    if (note?.id === 'new') {
      toast.error('Please save the note before generating PDF');
      return;
    }

    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      toast.error('You\'re not authenticated');
      return;
    }

    setIsPdfGenerating(true);
    
    toast.loading('Initiating PDF generation...', { id: 'pdf-init' });
    
    fetch(`/api/notes/${note?.id}/generate_pdf/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to start PDF generation');
        }
        return response.json();
      })
      .then((data) => {
        toast.dismiss('pdf-init');
        pollPdfStatus(data.task_id);
      })
      .catch((error) => {
        toast.dismiss('pdf-init');
        toast.error('Failed to generate PDF: ' + error.message);
        setIsPdfGenerating(false);
      });
  }

  function pollPdfStatus(taskId: string) {
    toast.loading('Processing PDF...', { id: 'pdf-status' });
    
    const checkStatus = () => {
      fetch(`/api/notes/${note?.id}/pdf_status/?task_id=${taskId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'complete') {
            toast.dismiss('pdf-status');
            toast.success('PDF generated successfully!');
            window.open(`/api/notes/${note?.id}/download_pdf/`, '_blank');
            setIsPdfGenerating(false);
          } else if (data.status === 'processing') {
            setTimeout(checkStatus, 1000);
          } else {
            toast.dismiss('pdf-status');
            toast.error('PDF generation failed');
            setIsPdfGenerating(false);
          }
        })
        .catch(() => {
          toast.dismiss('pdf-status');
          toast.error('Failed to check PDF status');
          setIsPdfGenerating(false);
        });
    };

    checkStatus();
  }

  function onSaveHandler() {
    const element = titleRef.current;
    if (!element) return;

    const title = element.textContent;
    if (!title) return void toast.error('Title should not be empty');
    if (!content) return void toast.error('Content should not be empty');

    const csrfToken = getCookie('csrftoken');

    if (!csrfToken) {
      return void toast.error('You\'re not authenticated');
    }

    const method = note?.id === 'new' ? 'POST' : 'PATCH';
    const endpoint = note?.id === 'new' ? '/api/notes/' : `/api/notes/${note?.id}/`;

    toast.promise(
      fetch(endpoint, {
        method: method,
        headers: {
          credentials: 'include',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          title: title,
          body: content,
        }),
      }).then((res) => {
        if (res.status > 299) {
          throw Error('Something went wrong');
        }
        mutate();
      }),
      {
        loading: 'Saving note...',
        error: 'Something went wrong',
        success: 'Note saved',
      },
    );
  }

  function onDeleteHandler(id: string) {
    if (id === 'new') return;
    const csrfToken = getCookie('csrftoken');

    if (!csrfToken) {
      return void toast.error("You're not authenticated");
    }

    toast.promise(
      fetch(`/api/notes/${id}/`, {
        method: 'DELETE',
        headers: {
          credentials: 'include', 
          'X-CSRFToken': csrfToken,
        },
      }).then((res) => {
        if (res.status > 299) {
          throw Error('Something went wrong');
        }
        mutate();
      }),
      {
        loading: 'Deleting note...',
        error: 'Something went wrong',
        success: 'Note deleted',
      },
    );
  }

  return (
    <main className="w-[calc(100%-256px)] relative">
      {note && (
        <div className="absolute right-16 top-8 flex items-center gap-4 z-10">
          <button
            className="block btn bg-white btn-outline"
            type="button"
            disabled={note.id === 'new' || isPdfGenerating}
            onClick={printHandler}
          >
            <PrinterIcon size={16} />
            {isPdfGenerating && <span className="ml-2">Processing...</span>}
          </button>
          <button className="block btn" type="button" onClick={onSaveHandler}>
            <SaveIcon size={16} />
          </button>
          <Alert
            title="Delete note"
            confirmMessage="Delete"
            onConfirm={() => void onDeleteHandler(note.id)}
            description="Are you sure you want to delete this note?"
          >
            <button
              className="block btn btn-error"
              type="button"
              disabled={note.id === 'new'}
            >
              <TrashIcon size={16} />
            </button>
          </Alert>
        </div>
      )}
      <>
        {note?.title && (
          <div className="mt-8 ml-[104px] text-4xl w-max p-4 font-serif *:focus:outline-none *:focus:border-none flex items-center">
            <span className="text-zinc-200 font-bold text-5xl mr-4">#</span>
            <h1 contentEditable ref={titleRef}>
              {note.title}
            </h1>
          </div>
        )}
        <Editor
          initialContent={note?.body ? note.body : ''}
          setter={setContent}
        />
      </>
    </main>
  );
}
