import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { useState } from "react";
import { IconEdit, IconCheck } from "@tabler/icons-react";
import {
    Overlay,
} from "@mantine/core";
import "./Rules.css";

export default function Rules({ room_id, authorized_users, content }) {
    const [editable, setEditable] = useState(false);
    const [saving, setSaving] = useState(false);

    const current_user = localStorage.getItem("user_id");

    const editor = useEditor({
        editable: editable,
        extensions: [
        StarterKit,
        Underline,
        Link,
        Superscript,
        SubScript,
        Highlight,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content,
    });

    async function saveChanges() {
        setSaving(true);
        editor.options.editable = false;
        const savedContent = editor.getHTML();
        
        const response = await fetch(`/api/rooms/update/${room_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
            body: JSON.stringify({
                'rules': savedContent,
            }),
        });
        if (!response.ok) {
            if (response.status === 403) {
                alert("You are not authorized to edit this room's rules.");
            } else {
                alert("Failed to save changes.");
            }
        }

        setEditable(false);
        setSaving(false);
    }

    return (
        <div style={{ position: "relative" }}>
        {!editable && authorized_users.includes(current_user) && (
            <IconEdit className="editbutton" onClick={() => {
                setEditable(true);
                editor.options.editable = true;
            }} />
        )}
        <RichTextEditor editor={editor}>
            {saving && <Overlay color="#ffffff" backgroundOpacity={0.10} />}
            {editable && authorized_users.includes(current_user) && (
            <RichTextEditor.Toolbar sticky stickyOffset={60}>
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

                <RichTextEditor.ControlsGroup>
                <RichTextEditor.Control
                    onClick={saveChanges}
                    aria-label="Apply Changes"
                    title="Apply Changes"
                >
                    <IconCheck stroke={1.5} size="1rem" />
                </RichTextEditor.Control>
                </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
            )}

            <RichTextEditor.Content />
        </RichTextEditor>
        </div>
    );
}
