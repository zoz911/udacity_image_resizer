document.addEventListener('DOMContentLoaded', () => {
    const resizeForm = document.querySelector('#resizeForm');
    const uploadForm = document.querySelector('#uploadForm');
    const galleryContainer = document.querySelector('#gallery');
    const imageUrlContainer = document.querySelector('#imageUrl');

    // Handle form submission for resizing
    if (resizeForm) {
        resizeForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(resizeForm);

            try {
                const response = await fetch('http://localhost:3000/api/resize', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to resize image');
                }

                const data = await response.json();
                const resizedImageUrl = data.resizedImagePath;

                // Show the resized image
                displayImage(resizedImageUrl);

                // Optionally, show URL
                document.querySelector('#imageUrl').textContent = resizedImageUrl;

            } catch (error) {
                console.error('Error resizing image:', error);
                alert('Failed to resize image. Please try again.');
            }
        });
    }

    // Handle form submission for uploading
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(uploadForm);

            try {
                const response = await fetch('http://localhost:3000/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                const uploadedImageUrl = data.imageUrl;

                // Optionally, show URL
                document.querySelector('#imageUrl').textContent = uploadedImageUrl;

                // Refresh gallery after upload
                fetchGallery();

            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
            }
        });
    }

    // Fetch gallery images
    async function fetchGallery() {
        try {
            const response = await fetch('http://localhost:3000/api/gallery');
            if (!response.ok) {
                throw new Error('Failed to fetch gallery');
            }

            const images = await response.json();
            galleryContainer.innerHTML = ''; // Clear existing images

            images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = `http://localhost:3000/${image.path}`; // Assuming `path` is in response
                imgElement.alt = image.filename;
                imgElement.classList.add('thumbnail');
                galleryContainer.appendChild(imgElement);
            });

        } catch (error) {
            console.error('Error fetching gallery:', error);
            alert('Failed to fetch gallery. Please try again.');
        }
    }

    // Initial fetch for gallery
    fetchGallery();

    // Function to display image
    function displayImage(url) {
        const imgElement = document.createElement('img');
        imgElement.src = url;
        imgElement.alt = 'Resized Image';
        imgElement.classList.add('resized-image');
        document.querySelector('#resizedImages').appendChild(imgElement);
    }
});
