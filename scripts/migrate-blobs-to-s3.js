import { PrismaClient } from '@prisma/client';
import aws from 'aws-sdk';
import 'dotenv/config';
import path from 'path';

const prisma = new PrismaClient();

// 配置 AWS
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new aws.S3();
const bucketName = process.env.AWS_BUCKET_NAME;

async function uploadToS3(buffer, folder, originalName, id) {
    const ext = path.extname(originalName || '') || '.jpg';
    const key = `${folder}/${Date.now()}_${id}${ext}`;

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg', // 預設為 jpeg
    };

    const result = await s3.upload(params).promise();
    return result.Location;
}

async function migrateBookingMovies() {
    console.log('Migrating booking_movie images...');
    const movies = await prisma.booking_movie.findMany({
        where: {
            movie_img_url: null,
            NOT: { movie_img: null }
        }
    });

    for (const movie of movies) {
        try {
            const url = await uploadToS3(movie.movie_img, 'movies', movie.title, movie.movie_id);
            await prisma.booking_movie.update({
                where: { movie_id: movie.movie_id },
                data: { movie_img_url: url }
            });
            console.log(`Migrated movie: ${movie.title}`);
        } catch (err) {
            console.error(`Failed to migrate movie ${movie.movie_id}:`, err.message);
        }
    }
}

async function migrateBarPics() {
    console.log('Migrating bar_pic images...');
    const pics = await prisma.bar_pic.findMany({
        where: {
            bar_img_url: null,
            NOT: { bar_img: null }
        }
    });

    for (const pic of pics) {
        try {
            const url = await uploadToS3(pic.bar_img, 'bars', pic.bar_pic_name, pic.bar_pic_id);
            await prisma.bar_pic.update({
                where: { bar_pic_id: pic.bar_pic_id },
                data: { bar_img_url: url }
            });
            console.log(`Migrated bar pic: ${pic.bar_pic_id}`);
        } catch (err) {
            console.error(`Failed to migrate bar pic ${pic.bar_pic_id}:`, err.message);
        }
    }
}

async function migrateCommunityPhotos() {
    console.log('Migrating community photos...');
    const photos = await prisma.comm_photo.findMany({
        where: {
            img_url: null
        }
    });

    for (const photo of photos) {
        try {
            const url = await uploadToS3(photo.img, 'community', photo.photo_name, photo.comm_photo_id);
            await prisma.comm_photo.update({
                where: { comm_photo_id: photo.comm_photo_id },
                data: { img_url: url }
            });
            console.log(`Migrated comm photo: ${photo.comm_photo_id}`);
        } catch (err) {
            console.error(`Failed to migrate comm photo ${photo.comm_photo_id}:`, err.message);
        }
    }
}

async function migrateEventPhotos() {
    console.log('Migrating event photos...');
    const photos = await prisma.comm_events_photo.findMany({
        where: {
            img_url: null
        }
    });

    for (const photo of photos) {
        try {
            const url = await uploadToS3(photo.img, 'events', photo.photo_name, photo.comm_events_photo_id);
            await prisma.comm_events_photo.update({
                where: { comm_events_photo_id: photo.comm_events_photo_id },
                data: { img_url: url }
            });
            console.log(`Migrated event photo: ${photo.comm_events_photo_id}`);
        } catch (err) {
            console.error(`Failed to migrate event photo ${photo.comm_events_photo_id}:`, err.message);
        }
    }
}

async function migrateAdminAvatars() {
    console.log('Migrating admin avatars...');
    const admins = await prisma.admin_user.findMany({
        where: {
            avatar_url: null,
            NOT: { avatar_img: null }
        }
    });

    for (const admin of admins) {
        try {
            const url = await uploadToS3(admin.avatar_img, 'admin_avatars', `admin_${admin.admin_user_id}`, admin.admin_user_id);
            await prisma.admin_user.update({
                where: { admin_user_id: admin.admin_user_id },
                data: { avatar_url: url }
            });
            console.log(`Migrated admin avatar: ${admin.admin_user_id}`);
        } catch (err) {
            console.error(`Failed to migrate admin ${admin.admin_user_id}:`, err.message);
        }
    }
}

async function main() {
    try {
        await migrateBookingMovies();
        await migrateBarPics();
        await migrateCommunityPhotos();
        await migrateEventPhotos();
        await migrateAdminAvatars();
        console.log('All migrations completed!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
