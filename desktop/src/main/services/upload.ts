import StreamZip from "node-stream-zip";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "original-fs";
import type { PendingUploads, ZipItem } from "../../types/ipc";
import { uploadStatusStore } from "../stores/upload-status";

export const listZipItems = async (zipPath: string): Promise<ZipItem[]> => {
    const zip = new StreamZip.async({ file: zipPath });

    const entries = await zip.entries();
    const entryNames: string[] = [];

    for (const entry of Object.values(entries)) {
        const basename = path.basename(entry.name);
        // Ignore "hidden" files (files whose names begins with a dot).
        if (entry.isFile && basename.length > 0 && basename[0] != ".") {
            // `entry.name` is the path within the zip.
            entryNames.push(entry.name);
        }
    }

    zip.close();

    return entryNames.map((entryName) => [zipPath, entryName]);
};

export const pathOrZipItemSize = async (
    pathOrZipItem: string | ZipItem,
): Promise<number> => {
    if (typeof pathOrZipItem == "string") {
        const stat = await fs.stat(pathOrZipItem);
        return stat.size;
    } else {
        const [zipPath, entryName] = pathOrZipItem;
        const zip = new StreamZip.async({ file: zipPath });
        const entry = await zip.entry(entryName);
        if (!entry)
            throw new Error(
                `An entry with name ${entryName} does not exist in the zip file at ${zipPath}`,
            );
        const size = entry.size;
        zip.close();
        return size;
    }
};

export const pendingUploads = async (): Promise<PendingUploads | undefined> => {
    const collectionName = uploadStatusStore.get("collectionName");

    const allFilePaths = uploadStatusStore.get("filePaths") ?? [];
    const filePaths = allFilePaths.filter((f) => existsSync(f));

    const allZipItems = uploadStatusStore.get("zipItems");
    let zipItems: typeof allZipItems;

    // Migration code - May 2024. Remove after a bit.
    //
    // The older store formats will not have zipItems and instead will have
    // zipPaths. If we find such a case, read the zipPaths and enqueue all of
    // their files as zipItems in the result.
    //
    // This potentially can be cause us to try reuploading an already uploaded
    // file, but the dedup logic will kick in at that point so no harm will come
    // off it.
    if (allZipItems === undefined) {
        const allZipPaths = uploadStatusStore.get("filePaths") ?? [];
        const zipPaths = allZipPaths.filter((f) => existsSync(f));
        zipItems = [];
        for (const zip of zipPaths)
            zipItems = zipItems.concat(await listZipItems(zip));
    } else {
        zipItems = allZipItems.filter(([z]) => existsSync(z));
    }

    if (filePaths.length == 0 && zipItems.length == 0) return undefined;

    return {
        collectionName,
        filePaths,
        zipItems,
    };
};

export const setPendingUploads = async (pendingUploads: PendingUploads) =>
    uploadStatusStore.set(pendingUploads);

export const markUploadedFiles = async (paths: string[]) => {
    const existing = uploadStatusStore.get("filePaths");
    const updated = existing?.filter((p) => !paths.includes(p));
    uploadStatusStore.set("filePaths", updated);
};

export const markUploadedZipItems = async (
    items: [zipPath: string, entryName: string][],
) => {
    const existing = uploadStatusStore.get("zipItems");
    const updated = existing?.filter(
        (z) => !items.some((e) => z[0] == e[0] && z[1] == e[1]),
    );
    uploadStatusStore.set("zipItems", updated);
};

export const clearPendingUploads = () => uploadStatusStore.clear();
