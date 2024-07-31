document.addEventListener('DOMContentLoaded', () => {
    const resizeForm = document.querySelector('#resizeForm');
    const uploadForm = document.querySelector('#uploadForm');
    const galleryContainer = document.querySelector('#gallery');
    const lastResizedImageLink = document.querySelector('#lastResizedImageLink');

    let selectedImage = null;

    resizeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get width and height inputs
        const widthInput = document.querySelector('#widthInput').value;
        const heightInput = document.querySelector('#heightInput').value;

        // Check if width and height are valid numbers
        const width = parseInt(widthInput, 10);
        const height = parseInt(heightInput, 10);
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            alert('Invalid width or height. Please enter positive numbers.');
            return;
        }

        const formData = new FormData(resizeForm);
        formData.append('filename', selectedImage);

        try {
            const response = await fetch('http://localhost:3000/api/resize', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to resize image');
            }

            const data = await response.json();
            if (data.error) {
                alert(data.error);
            } else {
                const resizedImageUrl = `http://localhost:3000/resized/${encodeURIComponent(data.filename)}`;

                lastResizedImageLink.href = resizedImageUrl;
                lastResizedImageLink.textContent = `Image: ${data.filename} (${data.width}x${data.height})`;
                localStorage.setItem('lastResizedImageUrl', resizedImageUrl);

                fetchGallery();
            }
        } catch (error) {
            console.error('Error resizing image:', error);
            alert('Failed to resize image. Please try again.');
        }
    });

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(uploadForm);

        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            alert('Image uploaded successfully');
            addImageToGallery(data.file.filename);
            fetchGallery();
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        }
    });

    async function fetchGallery() {
        try {
            const response = await fetch('http://localhost:3000/api/gallery');
            if (!response.ok) {
                throw new Error('Failed to fetch gallery');
            }

            const images = await response.json();
            galleryContainer.innerHTML = '';

            images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = `http://localhost:3000/resized/${encodeURIComponent(image.filename)}`;
                imgElement.alt = image.filename;
                imgElement.classList.add('thumbnail');
                imgElement.onclick = () => selectImage(image.filename);
                galleryContainer.appendChild(imgElement);
            });
        } catch (error) {
            console.error('Error fetching gallery:', error);
            alert('Failed to fetch gallery. Please try again.');
        }
    }

    fetchGallery();

    function addImageToGallery(filename) {
        const gallery = document.getElementById('gallery');
        const img = document.createElement('img');
        img.src = `http://localhost:3000/uploads/${encodeURIComponent(filename)}`;
        img.onclick = () => selectImage(filename);
        gallery.appendChild(img);
    }

    function selectImage(filename) {
        selectedImage = filename;
        const images = document.querySelectorAll('#gallery img');
        images.forEach((img) => img.classList.remove('selected'));
        const selectedImg = Array.from(images).find((img) => img.src.includes(encodeURIComponent(filename)));
        selectedImg.classList.add('selected');
    }

    const lastResizedImageUrl = localStorage.getItem('lastResizedImageUrl');
    if (lastResizedImageUrl) {
        lastResizedImageLink.href = lastResizedImageUrl;
        lastResizedImageLink.textContent = lastResizedImageUrl;
    }
});
