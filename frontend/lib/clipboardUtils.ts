/**
 * Clipboard utilities for handling image paste and drag-drop functionality
 * Supports: JPG, JPEG, PNG, WebP, GIF
 */

const SUPPORTED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
];

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
};

/**
 * Validates if a file is a supported image format
 */
export function validateImageFormat(file: File): boolean {
    return SUPPORTED_MIME_TYPES.includes(file.type);
}

/**
 * Extracts images from a ClipboardEvent (paste event)
 * This works cross-browser using the event's clipboardData
 */
export function extractImagesFromPasteEvent(e: ClipboardEvent): File[] {
    const files: File[] = [];
    const items = e.clipboardData?.items;
    if (!items) return files;

    for (const item of Array.from(items)) {
        if (item.kind === 'file' && SUPPORTED_MIME_TYPES.includes(item.type)) {
            const file = item.getAsFile();
            if (file) {
                const ext = MIME_TYPE_TO_EXTENSION[item.type] || 'png';
                // Rename with a meaningful name since pasted images have no name
                const renamed = new File([file], `pasted-image-${Date.now()}.${ext}`, {
                    type: item.type
                });
                files.push(renamed);
            }
        }
    }

    return files;
}

/**
 * Filters files by supported image format from a FileList or array (for drag-drop)
 */
export function filterImageFiles(files: FileList | File[]): File[] {
    return Array.from(files).filter(file => validateImageFormat(file));
}
