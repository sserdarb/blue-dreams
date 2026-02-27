const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function updateRooms() {
    const baseDir = path.join(__dirname, 'public', 'images', 'rooms');
    const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());
    
    for (const folder of folders) {
        let files = fs.readdirSync(path.join(baseDir, folder)).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
        if (files.length === 0) continue;
        
        let fileStr = files[0];
        const imgUrl = '/images/rooms/' + folder + '/' + fileStr;
        
        const dbRooms = await prisma.room.findMany();
        
        for (const room of dbRooms) {
             const titleLower = room.title.toLowerCase();
             const folderLower = folder.toLowerCase();
             let isMatch = false;
             
             if (folderLower === 'club family room' && titleLower.includes('club') && titleLower.includes('aile')) isMatch = true;
             else if (folderLower === 'club room' && titleLower.includes('club') && !titleLower.includes('aile') && !titleLower.includes('deniz') && !titleLower.includes('sea')) isMatch = true;
             else if (folderLower === 'club room sea view' && titleLower.includes('club') && (titleLower.includes('deniz') || titleLower.includes('sea'))) isMatch = true;
             else if (folderLower === 'deluxe family room' && titleLower.includes('deluxe') && titleLower.includes('aile')) isMatch = true;
             else if (folderLower === 'deluxe room sea view' && titleLower.includes('deluxe')) isMatch = true;

             if (isMatch) {
                 await prisma.room.update({
                     where: { id: room.id },
                     data: { image: imgUrl }
                 });
                 console.log('Updated', room.title, room.locale, 'with', imgUrl);
             }
        }
    }
    await prisma.$disconnect();
}
updateRooms().catch(console.error);
