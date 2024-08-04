document.addEventListener('DOMContentLoaded', () => {
    const resizeForm = document.querySelector('#resizeForm');
    const uploadForm = document.querySelector('#uploadForm');
    const galleryContainer = document.querySelector('#gallery');
    const lastResizedImageLink = document.querySelector('#lastResizedImageLink');
    const resizeImageInput = document.querySelector('#resizeImageInput');
    const selectedImageInput = document.querySelector('#selectedImage');

    let selectedImageFilename = null;
    let selectedImageBlob = null;

    // Handle form submission for resizing
    resizeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const widthInput = document.querySelector('#widthInput').value;
        const heightInput = document.querySelector('#heightInput').value;

        const width = parseInt(widthInput, 10);
        const height = parseInt(heightInput, 10);
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            alert('Invalid width or height. Please enter positive numbers.');
            return;
        }

        if (!resizeImageInput.files.length && !selectedImageBlob) {
            alert('Please select an image from the gallery or upload a new one.');
            return;
        }

        const formData = new FormData();
        if (selectedImageBlob) {
            formData.append('image', selectedImageBlob, selectedImageFilename);
        } else {
            formData.append('image', resizeImageInput.files[0]);
        }
        formData.append('width', width);
        formData.append('height', height);

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

    // Handle form submission for uploading
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

    // Function to fetch and display images in the gallery
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

    // Function to add an image to the gallery
    function addImageToGallery(filename) {
        const gallery = document.getElementById('gallery');
        const img = document.createElement('img');
        img.src = `http://localhost:3000/uploads/${encodeURIComponent(filename)}`;
        img.classList.add('thumbnail');
        img.onclick = () => selectImage(filename);
        gallery.appendChild(img);
    }

    // Function to select an image from the gallery
    function selectImage(filename) {
        selectedImageFilename = filename;

        // Highlight the selected image
        const images = document.querySelectorAll('#gallery img');
        images.forEach((img) => img.classList.remove('selected'));
        const selectedImg = Array.from(images).find((img) => img.src.includes(encodeURIComponent(filename)));
        if (selectedImg) {
            selectedImg.classList.add('selected');
        }

        // Fetch the selected image file from the server
        fetch(`http://localhost:3000/resized/${encodeURIComponent(filename)}`)
            .then(response => response.blob())
            .then(blob => {
                selectedImageBlob = blob;
                const file = new File([blob], filename, { type: 'image/jpeg' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                resizeImageInput.files = dataTransfer.files;
            })
            .catch(error => console.error('Error fetching image blob:', error));

        // Update the hidden input with the selected image filename
        selectedImageInput.value = filename;
    }

    // Handle URL of last resized image
    const lastResizedImageUrl = localStorage.getItem('lastResizedImageUrl');
    if (lastResizedImageUrl) {
        lastResizedImageLink.href = lastResizedImageUrl;
        lastResizedImageLink.textContent = lastResizedImageUrl;
    }

    // Initial gallery load
    fetchGallery();
});