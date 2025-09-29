const fs = require('fs/promises');
const path = require('path');

// This script runs from the project root
const PUBLIC_DIR = 'public';
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets', 'thienthu');
const MANIFEST_PATH = path.join(PUBLIC_DIR, 'thienthu_images.json');

const CATEGORY_MAP = {
  tieu_hao: "Tiêu hao",
  trang_bi: "Trang bị",
  phap_bao: "Pháp bảo",
  cong_phap: "Công pháp",
  npc: "NPC"
};

async function generateManifest() {
  console.log('Bắt đầu tạo manifest cho thư viện ảnh...');

  try {
    let existingManifest = { categories: {}, images: [] };
    try {
      const existingContent = await fs.readFile(MANIFEST_PATH, 'utf-8');
      existingManifest = JSON.parse(existingContent);
      console.log('Đã tìm thấy manifest cũ, sẽ giữ lại các tags và ảnh đã có.');
    } catch (error) {
      console.log('Không tìm thấy manifest cũ. Sẽ tạo một file hoàn toàn mới.');
      // Initialize categories if manifest is new
      for (const key in CATEGORY_MAP) {
        existingManifest.categories[key] = { name: CATEGORY_MAP[key], tags: [] };
      }
    }

    const existingImagesMap = new Map(existingManifest.images.map(img => [img.fileName, img]));
    const newImageList = [];
    const categoriesInDir = await fs.readdir(ASSETS_DIR, { withFileTypes: true });

    for (const categoryDir of categoriesInDir) {
      if (categoryDir.isDirectory()) {
        const categoryKey = categoryDir.name;
        const categoryPath = path.join(ASSETS_DIR, categoryKey);
        const files = (await fs.readdir(categoryPath)).filter(f => !f.startsWith('.'));

        for (const file of files) {
          if (/\.(png|jpg|jpeg|webp|gif)$/i.test(file)) {
            const relativePath = path.join('assets', 'thienthu', categoryKey, file).replace(/\\/g, '/');
            
            if (existingImagesMap.has(relativePath)) {
              // If image exists, push the existing data (with tags)
              newImageList.push(existingImagesMap.get(relativePath));
            } else {
              // If image is new, add it with an empty tags array
              console.log(`Phát hiện ảnh mới: ${relativePath}. Đã thêm vào manifest với tag rỗng.`);
              newImageList.push({
                fileName: relativePath,
                category: categoryKey,
                tags: [],
              });
            }
          }
        }
        
        // Ensure category exists in the manifest's categories object
        if (!existingManifest.categories[categoryKey]) {
            console.log(`Phát hiện category mới: ${categoryKey}`);
            existingManifest.categories[categoryKey] = {
                name: CATEGORY_MAP[categoryKey] || categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
                tags: []
            };
        }
      }
    }
    
    // Sort the final list for consistency
    newImageList.sort((a, b) => a.fileName.localeCompare(b.fileName));

    const finalManifest = {
      categories: existingManifest.categories,
      images: newImageList,
    };

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(finalManifest, null, 2), 'utf-8');
    console.log(`Tạo manifest thành công! ${newImageList.length} ảnh đã được cập nhật vào file ${MANIFEST_PATH}.`);

  } catch (error) {
    console.error('Lỗi nghiêm trọng khi tạo manifest:', error);
    process.exit(1);
  }
}

generateManifest();
