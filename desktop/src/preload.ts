import {
    deleteDiskCache,
    getCacheDirectory,
    openDiskCache,
    setCustomCacheDirectory,
} from "./api/cache";
import { computeImageEmbedding, computeTextEmbedding } from "./api/clip";
import {
    getAppVersion,
    getPlatform,
    getSentryUserID,
    logToDisk,
    openDirectory,
    openLogDirectory,
    selectDirectory,
    updateOptOutOfCrashReports,
} from "./api/common";
import { clearElectronStore } from "./api/electronStore";
import {
    checkExistsAndCreateDir,
    exists,
    saveFileToDisk,
    saveStreamToDisk,
} from "./api/export";
import { runFFmpegCmd } from "./api/ffmpeg";
import {
    deleteFile,
    deleteFolder,
    getDirFiles,
    isFolder,
    moveFile,
    readTextFile,
    rename,
} from "./api/fs";
import { convertToJPEG, generateImageThumbnail } from "./api/imageProcessor";
import { getEncryptionKey, setEncryptionKey } from "./api/safeStorage";
import {
    muteUpdateNotification,
    registerForegroundEventListener,
    registerUpdateEventListener,
    reloadWindow,
    sendNotification,
    skipAppUpdate,
    updateAndRestart,
} from "./api/system";
import {
    getElectronFilesFromGoogleZip,
    getPendingUploads,
    setToUploadCollection,
    setToUploadFiles,
    showUploadDirsDialog,
    showUploadFilesDialog,
    showUploadZipDialog,
} from "./api/upload";
import {
    addWatchMapping,
    getWatchMappings,
    registerWatcherFunctions,
    removeWatchMapping,
    updateWatchMappingIgnoredFiles,
    updateWatchMappingSyncedFiles,
} from "./api/watch";
import { setupLogging } from "./utils/logging";
import { fixHotReloadNext12 } from "./utils/preload";
import {
    logRendererProcessMemoryUsage,
    setupRendererProcessStatsLogger,
} from "./utils/processStats";

fixHotReloadNext12();
setupLogging();
setupRendererProcessStatsLogger();

const windowObject: any = window;

windowObject["ElectronAPIs"] = {
    exists,
    checkExistsAndCreateDir,
    saveStreamToDisk,
    saveFileToDisk,
    selectDirectory,
    clearElectronStore,
    sendNotification,
    reloadWindow,
    readTextFile,
    showUploadFilesDialog,
    showUploadDirsDialog,
    getPendingUploads,
    setToUploadFiles,
    showUploadZipDialog,
    getElectronFilesFromGoogleZip,
    setToUploadCollection,
    getEncryptionKey,
    setEncryptionKey,
    openDiskCache,
    deleteDiskCache,
    getDirFiles,
    getWatchMappings,
    addWatchMapping,
    removeWatchMapping,
    registerWatcherFunctions,
    isFolder,
    updateWatchMappingSyncedFiles,
    updateWatchMappingIgnoredFiles,
    logToDisk,
    convertToJPEG,
    openLogDirectory,
    registerUpdateEventListener,
    updateAndRestart,
    skipAppUpdate,
    getSentryUserID,
    getAppVersion,
    runFFmpegCmd,
    muteUpdateNotification,
    generateImageThumbnail,
    logRendererProcessMemoryUsage,
    registerForegroundEventListener,
    openDirectory,
    moveFile,
    deleteFolder,
    rename,
    deleteFile,
    updateOptOutOfCrashReports,
    computeImageEmbedding,
    computeTextEmbedding,
    getPlatform,
    getCacheDirectory,
    setCustomCacheDirectory,
};
