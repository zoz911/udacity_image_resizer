# Image Processing Project

This is a cool project where you can make a program that changes pictures! You'll use special tools called Node.js, Express, and Sharp to build it.

## What it does:
- Lets you add pictures
- Makes pictures smaller or bigger
- Shows you a page with all the changed pictures
- Finds and shows you a picture that's a certain size

## Folders and Files:
Your project will have folders like this:
- `src`: Where your program's code goes
- `resized`: For pictures that you made smaller
- `uploads`: For pictures you add
- `spec`: For testing your program
- `package.json`: Tells about your project
- `tsconfig.json`: For TypeScript settings (if you use it)

## To start:
1. Get Node.js and npm (special programs for computers)
2. Copy the project files to your computer
3. Install other needed programs: `npm install`
4. Make folders for uploads and resized pictures: `mkdir -p uploads resized`
5. Start the program: `npm start`
6. Open your web browser to see it: [http://127.0.0.1:3001](http://127.0.0.1:3001) or [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Using the program:
- Add a picture: Go to `/api/upload` and send the picture file
- Make a picture smaller: Go to `/api/resize` and send the picture, new size (width and height)
- See a picture: Go to `/api/images` and tell it the picture name and size
- See all changed pictures: Go to `/api/gallery`

## Testing:
To check if everything works, use: `npm test`

## Remember:
- Make sure the upload and resized folders are there.
- The program runs on port 3000 or 3001.
- You can change pictures using Sharp.
