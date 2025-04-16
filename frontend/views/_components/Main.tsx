import { useEffect, useState } from 'react';
import { Editor } from './Editor';
import { PrinterIcon, SaveIcon, TrashIcon } from 'lucide-react';
import type { PageProps } from '../index';

interface MainProps {
  note: PageProps['notes'][number] | null;
}

export function Main({ note }: MainProps) {
  const [content, setContent] = useState(note?.body);

  useEffect(() => {
    if (!note) return;
    setContent(note.body);
  }, [note]);

  function printHandler() {
    console.log(content);
  }

  return (
    <main className="w-[calc(100%-256px)] relative">
      {note && (
        <div className="absolute right-16 top-8 flex items-center gap-4 z-10">
          <button
            className="block btn bg-white btn-outline"
            type="button"
            onClick={printHandler}
          >
            <PrinterIcon size={16} />
          </button>
          <button className="block btn" type="button">
            <SaveIcon size={16} />
          </button>
          <button className="block btn btn-error" type="button">
            <TrashIcon size={16} />
          </button>
        </div>
      )}
      <>
        {note?.title && (
          <div className="mt-8 ml-[104px] text-4xl w-max p-4 font-serif *:focus:outline-none *:focus:border-none flex items-center">
            <span className="text-zinc-200 font-bold text-5xl mr-4">#</span>
            <h1 contentEditable>{note.title}</h1>
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
