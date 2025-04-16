import { MilkdownProvider } from '@milkdown/react';
import './app.crepe.css';
import { NavBar } from './_components/NavBar';
import { useState } from 'react';
import clsx from 'clsx';
import { Main } from './_components/Main';
import { PlusCircleIcon } from 'lucide-react';

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

export default function Page(props: PageProps) {
  const [selectedNote, setSelectedNote] = useState<
    PageProps['notes'][number] | null
  >(defaultNote);

  function selectNoteHandler(id: string) {
    const note = props.notes.find((note) => note.id === id);

    if (note) {
      setSelectedNote(note);
    }
  }

  function newNoteHandler() {
    setSelectedNote(defaultNote);
  }

  return (
    <>
      <NavBar name={props.user.username} />
      <div className="flex flex-1">
        <div className="w-64 divide-y bg-zinc-100 border-r h-dvh">
          {props.notes.map((note) => (
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
