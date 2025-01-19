import multer from 'multer';

const createMulterStorage = (destinationPath: string) =>
    multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, destinationPath);
        },
        filename: function (_req, file, cb) {
            const ext = file.originalname
                .split('.')
                .filter(Boolean)
                .slice(1)
                .join('.');
            cb(null, Date.now() + '.' + ext);
        }
    });

export const createMulterUpload = (
    ...storageParams: Parameters<typeof createMulterStorage>
) => multer({ storage: createMulterStorage(...storageParams) });
