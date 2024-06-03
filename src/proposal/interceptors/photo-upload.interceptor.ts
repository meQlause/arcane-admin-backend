import { Injectable } from '@nestjs/common';
import {
    MulterOptionsFactory,
    MulterModuleOptions,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Injectable()
export class PhotoUploadInterceptor implements MulterOptionsFactory {
    createMulterOptions(): MulterModuleOptions {
        return {
            limits: { fileSize: 2000000 },
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueName =
                        'file-' +
                        Date.now() +
                        '-' +
                        Math.floor(Math.random() * 1000000) +
                        '.' +
                        file.mimetype.split('/')[1];

                    cb(null, uniqueName);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return cb(null, false);
                }
                return cb(null, true);
            },
        };
    }
}
