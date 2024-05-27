import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';

const content =
  `<h2 style="text-align: center">Draft Rules</h2><p>The point limit is 115 points, for 9-12 Pokémon, with draft pools of 8 players.</p><p></p><p>The following clauses are in effect:</p><ol><li><p>Species Clause: A player cannot have two Pokémon with the same National Pokedex number on a team.</p></li><li><p>Sleep Clause: If a player has already put a Pokémon on their opponent's side to sleep and it is still sleeping, another one can't be put to sleep.</p></li><li><p>Evasion Clause: A Pokémon may not hold an item, use a move or possess an ability that can increase their evasion stat.</p></li><li><p>OHKO Clause: A Pokémon may not have the moves Fissure, Guillotine, Horn Drill, or Sheer Cold in its moveset.</p></li><li><p>Moody Clause: A team cannot have a Pokémon with the ability Moody.</p></li><li><p>Endless Battle Clause: Players cannot intentionally prevent an opponent from being able to end the game without forfeiting.</p></li><li><p>Baton Pass Clause: A Pokémon may not Baton Pass any stats, Substitutes, Ingrains etc.</p></li></ol><p></p><p>Certain Pokemon may not Terastallize as listed.</p><p></p><p>The following moves are banned on all Pokémon: </p><ul><li><p>Last Respects</p></li><li><p>Shed Tail</p></li></ul>`;

export default function CreateDraftRules() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
  });
  
  function printtoconsole() {
    console.log(editor.getHTML());
  }

  

  return (
    
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}