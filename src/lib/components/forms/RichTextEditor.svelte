<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';

	/** Two-way bindable HTML content (`bind:content`) */
	export let content = '';
	export let id = 'rich-text-editor';
	export let placeholder = 'Escriba el contenido…';
	/** async (file: File) => url string. When null/undefined, image upload is disabled. */
	export let onUploadImage = null;
	export let disabledHint = '';

	const dispatch = createEventDispatcher();

	let element;
	let fileInput;
	let editor;
	let uploading = false;
	let uploadError = null;
	let active = {};

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image],
			content,
			editable: true,
			autofocus: 'end',
			onUpdate: ({ editor: ed }) => {
				content = ed.getHTML();
				dispatch('change', content);
			},
			onSelectionUpdate: updateActiveStates,
			onTransaction: updateActiveStates,
		});
		updateActiveStates();
	});

	onDestroy(() => editor?.destroy());

	function updateActiveStates() {
		if (!editor) return;
		active = {
			bold: editor.isActive('bold'),
			italic: editor.isActive('italic'),
			h2: editor.isActive('heading', { level: 2 }),
			h3: editor.isActive('heading', { level: 3 }),
			bulletList: editor.isActive('bulletList'),
			orderedList: editor.isActive('orderedList'),
			link: editor.isActive('link'),
		};
	}

	/** Replace the editor's content from outside (e.g. form reset). */
	export function setContent(html) {
		content = html || '';
		editor?.commands.setContent(content, false);
	}

	async function handleFiles(files) {
		if (!onUploadImage || !files?.length) return;
		uploading = true;
		uploadError = null;
		try {
			for (const file of files) {
				if (!file.type.startsWith('image/')) continue;
				const url = await onUploadImage(file);
				editor.chain().focus().setImage({ src: url, alt: '' }).run();
			}
		} catch (e) {
			uploadError = e.message;
		} finally {
			uploading = false;
		}
	}

	function onFileInputChange(e) {
		handleFiles(e.target.files);
		e.target.value = '';
	}

	function onDrop(e) {
		e.preventDefault();
		handleFiles(e.dataTransfer?.files);
	}

	function onDragOver(e) {
		e.preventDefault();
	}

	function setLink() {
		const url = window.prompt('URL del enlace:', editor.getAttributes('link').href ?? 'https://');
		if (url === null) return;
		if (url === '') {
			editor.chain().focus().unsetLink().run();
			return;
		}
		editor.chain().focus().setLink({ href: url }).run();
	}
</script>

<div class="rich-text-editor">
	<div class="rich-text-toolbar" role="toolbar" aria-label="Formato de texto">
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.bold}
			aria-pressed={active.bold}
			aria-label="Negrita"
			on:click={() => editor.chain().focus().toggleBold().run()}
		>
			<i class="bi bi-type-bold" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.italic}
			aria-pressed={active.italic}
			aria-label="Cursiva"
			on:click={() => editor.chain().focus().toggleItalic().run()}
		>
			<i class="bi bi-type-italic" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.h2}
			aria-pressed={active.h2}
			aria-label="Encabezado 2"
			on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
		>
			<i class="bi bi-type-h2" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.h3}
			aria-pressed={active.h3}
			aria-label="Encabezado 3"
			on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
		>
			<i class="bi bi-type-h3" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.bulletList}
			aria-pressed={active.bulletList}
			aria-label="Lista con viñetas"
			on:click={() => editor.chain().focus().toggleBulletList().run()}
		>
			<i class="bi bi-list-ul" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.orderedList}
			aria-pressed={active.orderedList}
			aria-label="Lista numerada"
			on:click={() => editor.chain().focus().toggleOrderedList().run()}
		>
			<i class="bi bi-list-ol" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.link}
			aria-pressed={active.link}
			aria-label="Insertar enlace"
			on:click={setLink}
		>
			<i class="bi bi-link-45deg" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			aria-label="Insertar imagen"
			disabled={!onUploadImage}
			title={!onUploadImage ? disabledHint : 'Insertar imagen'}
			on:click={() => fileInput.click()}
		>
			<i class="bi bi-image" aria-hidden="true"></i>
		</button>
		<input
			type="file"
			accept="image/*"
			multiple
			class="visually-hidden"
			bind:this={fileInput}
			on:change={onFileInputChange}
			aria-hidden="true"
			tabindex="-1"
		/>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			aria-label="Deshacer"
			on:click={() => editor.chain().focus().undo().run()}
		>
			<i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			aria-label="Rehacer"
			on:click={() => editor.chain().focus().redo().run()}
		>
			<i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
		</button>
	</div>

	<div
		{id}
		class="rich-text-content"
		bind:this={element}
		on:drop={onDrop}
		on:dragover={onDragOver}
		on:click={() => editor?.chain().focus('end').run()}
		role="textbox"
		aria-multiline="true"
		aria-label={placeholder}
	></div>

	{#if !onUploadImage && disabledHint}
		<p class="form-text">{disabledHint}</p>
	{/if}
	{#if uploading}
		<p class="small text-muted mt-1">
			<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Subiendo imagen…
		</p>
	{/if}
	{#if uploadError}
		<p class="small text-danger mt-1" role="alert">{uploadError}</p>
	{/if}
</div>
