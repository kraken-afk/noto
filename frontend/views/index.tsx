import { MilkdownProvider } from '@milkdown/react';
import { Toaster } from 'sonner';
import './app.crepe.css';
import { NavBar } from './_components/NavBar';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Main } from './_components/Main';
import { PlusCircleIcon } from 'lucide-react';
import useSWR from 'swr';

export interface PageProps {
  user: {
    id: string;
    username: string;
  };
  notes: {
    id: string;
    title: string;
    body: string;
    is_public: boolean;
  }[];
}

const defaultNote = {
  id: 'new',
  title: 'New Note',
  body: '',
  is_public: false,
};

export const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Accept: 'application/json',
      credentials: 'include',
    },
  }).then((res) => res.json());

export default function Page(props: PageProps) {
  const { data } = useSWR<PageProps['notes']>('/api/notes', fetcher);
  const [notes, setNotes] = useState<PageProps['notes']>(props.notes);
  const [selectedNote, setSelectedNote] = useState<
    PageProps['notes'][number] | null
  >(props.notes?.at(-1) || defaultNote);

  useEffect(() => {
    if (!data) return;
    if (JSON.stringify(notes) === JSON.stringify(data)) return;

    setNotes(data);
    setSelectedNote(data.at(-1) || defaultNote);
  }, [data, notes]);

  function selectNoteHandler(id: string) {
    const note = notes.find((note) => note.id === id);

    if (note) {
      setSelectedNote(note);
    }
  }

  function newNoteHandler() {
    setSelectedNote(defaultNote);
  }

  return (
    <>
      <Toaster position="top-center" />
      <NavBar name={props.user.username} />
      <div className="flex flex-1">
        <div className="w-64 divide-y bg-zinc-100 border-r h-dvh">
          {notes.map((note) => (
            <button
              className={clsx(
                note.id === selectedNote?.id && 'border-b !bg-white',
                'block w-full h-20 bg-zinc-100 cursor-pointer transition-all hover:bg-white',
              )}
              key={note.id}
              type="button"
              onClick={() => selectNoteHandler(note.id)}
            >
              <span>{note.title}</span>
            </button>
          ))}
          <button
            className={clsx(
              selectedNote?.id === 'new' && '!bg-white',
              'w-full h-20 bg-zinc-100 cursor-pointer transition-all hover:bg-white border-b border-dashed font-bold text-zinc-400 flex items-center justify-center space-x-1',
            )}
            type="button"
            onClick={newNoteHandler}
          >
            <span>New Note</span>
            <PlusCircleIcon size={16} />
          </button>
        </div>
        <MilkdownProvider>
          <Main note={selectedNote} />
        </MilkdownProvider>
      </div>
    </>
  );
}
