<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Embed from '$lib/editor/embed-node.js';
	import CaptionedImage from '$lib/editor/captioned-image.js';
	import { detectEmbed, EMBED_KIND_LABELS } from '$lib/editor/embed.js';

	/** Two-way bindable HTML content (`bind:content`) */
	export let content = '';
	export let id = 'rich-text-editor';
	export let placeholder = 'Escriba el contenido…';
	/** async (file: File) => url string. When null/undefined, image upload is disabled. */
	export let onUploadImage = null;
	/** async (file: File) => url string. When null/undefined, PDF upload is disabled. */
	export let onUploadPdf = null;
	export let disabledHint = '';

	const dispatch = createEventDispatcher();

	let element;
	let fileInput;
	let pdfFileInput;
	let editor;
	let uploading = false;
	let uploadError = null;
	let active = {};

	// Embed dialog state
	let embedDialog;
	let embedUrl = '';
	$: embedPreview = detectEmbed(embedUrl);

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit.configure({ link: { openOnClick: false } }),
				CaptionedImage,
				Embed,
			],
			content,
			editable: true,
			autofocus: 'end',
			onUpdate: ({ editor: ed }) => {
				content = ed.getHTML();
				dispatch('change', content);
			},
			onSelectionUpdate: updateActiveStates,
			onTransaction: updateActiveStates,
			editorProps: {
				handlePaste: (view, event) => {
					const text = event.clipboardData?.getData('text/plain')?.trim();
					if (!text || /\s/.test(text)) return false;
					const detected = detectEmbed(text);
					if (!detected) return false;
					if (detected.kind === 'image') {
						editor.chain().focus().setImage({ src: detected.src, alt: '' }).run();
					} else {
						editor.chain().focus().setEmbed({ src: detected.src, embedType: detected.kind }).run();
					}
					return true;
				},
			},
		});
		updateActiveStates();
	});

	onDestroy(() => editor?.destroy());

	function updateActiveStates() {
		if (!editor) return;
		active = {
			bold: editor.isActive('bold'),
			italic: editor.isActive('italic'),
			strike: editor.isActive('strike'),
			h2: editor.isActive('heading', { level: 2 }),
			h3: editor.isActive('heading', { level: 3 }),
			bulletList: editor.isActive('bulletList'),
			orderedList: editor.isActive('orderedList'),
			blockquote: editor.isActive('blockquote'),
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

	async function handlePdfFiles(files) {
		if (!onUploadPdf || !files?.length) return;
		uploading = true;
		uploadError = null;
		try {
			for (const file of files) {
				if (file.type !== 'application/pdf') continue;
				const url = await onUploadPdf(file);
				editor.chain().focus().setEmbed({ src: url, embedType: 'pdf', title: file.name }).run();
			}
		} catch (e) {
			uploadError = e.message;
		} finally {
			uploading = false;
		}
	}

	function onPdfFileInputChange(e) {
		handlePdfFiles(e.target.files);
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

	function openEmbedDialog() {
		embedUrl = '';
		if (typeof embedDialog?.showModal === 'function') embedDialog.showModal();
	}

	function closeEmbedDialog() {
		embedDialog?.close();
	}

	function confirmEmbed() {
		if (!embedPreview) return;
		if (embedPreview.kind === 'image') {
			editor.chain().focus().setImage({ src: embedPreview.src, alt: '' }).run();
		} else {
			editor.chain().focus().setEmbed({ src: embedPreview.src, embedType: embedPreview.kind }).run();
		}
		closeEmbedDialog();
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
			title="Negrita"
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
			title="Cursiva"
			on:click={() => editor.chain().focus().toggleItalic().run()}
		>
			<i class="bi bi-type-italic" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.strike}
			aria-pressed={active.strike}
			aria-label="Tachado"
			title="Tachado"
			on:click={() => editor.chain().focus().toggleStrike().run()}
		>
			<i class="bi bi-type-strikethrough" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.h2}
			aria-pressed={active.h2}
			aria-label="Encabezado 2"
			title="Encabezado 2"
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
			title="Encabezado 3"
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
			title="Lista con viñetas"
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
			title="Lista numerada"
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
			title="Insertar enlace"
			on:click={setLink}
		>
			<i class="bi bi-link-45deg" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			class:active={active.blockquote}
			aria-pressed={active.blockquote}
			aria-label="Cita"
			title="Cita"
			on:click={() => editor.chain().focus().toggleBlockquote().run()}
		>
			<i class="bi bi-quote" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			aria-label="Línea horizontal"
			title="Línea horizontal"
			on:click={() => editor.chain().focus().setHorizontalRule().run()}
		>
			<i class="bi bi-hr" aria-hidden="true"></i>
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
			aria-label="Insertar PDF"
			disabled={!onUploadPdf}
			title={!onUploadPdf ? disabledHint : 'Insertar PDF'}
			on:click={() => pdfFileInput.click()}
		>
			<i class="bi bi-file-earmark-pdf" aria-hidden="true"></i>
		</button>
		<input
			type="file"
			accept="application/pdf"
			multiple
			class="visually-hidden"
			bind:this={pdfFileInput}
			on:change={onPdfFileInputChange}
			aria-hidden="true"
			tabindex="-1"
		/>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			aria-label="Insertar embed (YouTube, PDF, IIIF, iframe)"
			title="Insertar embed (YouTube, PDF, IIIF, iframe)"
			on:click={openEmbedDialog}
		>
			<i class="bi bi-code-square" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			aria-label="Deshacer"
			title="Deshacer"
			on:click={() => editor.chain().focus().undo().run()}
		>
			<i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
		</button>
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary"
			aria-label="Rehacer"
			title="Rehacer"
			on:click={() => editor.chain().focus().redo().run()}
		>
			<i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
		</button>
	</div>

	<div
		{id}
		class="rich-text-content"
		bind:this={element}
		tabindex="0"
		on:drop={onDrop}
		on:dragover={onDragOver}
		on:click={(e) => {
			// Only force focus-to-end when clicking empty space below the content
			// (i.e. the wrapper itself, not a child node). Clicks on text let
			// ProseMirror place the cursor where clicked.
			if (e.target === element) editor?.chain().focus('end').run();
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' && e.target === element) editor?.chain().focus('end').run();
		}}
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

<dialog bind:this={embedDialog} class="embed-dialog" aria-label="Insertar embed">
	<form method="dialog" on:submit|preventDefault={confirmEmbed}>
		<h2 class="h5">Insertar embed</h2>
		<p class="form-text mb-2">
			Pega una URL de YouTube, un PDF, un manifiesto IIIF o cualquier página incrustable.
		</p>
		<label class="form-label" for="embed-url-input">URL</label>
		<input
			id="embed-url-input"
			class="form-control"
			type="url"
			bind:value={embedUrl}
			placeholder="https://…"
			required
		/>
		<div class="form-text" aria-live="polite">
			{#if embedUrl && embedPreview}
				Se insertará como: <strong>{EMBED_KIND_LABELS[embedPreview.kind]}</strong>
			{:else if embedUrl}
				URL no reconocida o no válida.
			{:else}
				El tipo se detectará automáticamente.
			{/if}
		</div>
		<div class="d-flex justify-content-end gap-2 mt-3">
			<button type="button" class="btn btn-outline-secondary btn-sm" on:click={closeEmbedDialog}>
				Cancelar
			</button>
			<button type="submit" class="btn btn-primary btn-sm" disabled={!embedPreview}>
				Insertar
			</button>
		</div>
	</form>
</dialog>
