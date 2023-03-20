# Memory Matching Game
## *Oh look, it's another classic intro-to-coding matching game project!*

...but reimagined with 50% more pain. Because why build it with DOM manipulation and CSS styling like a normal person, when I can build it with Canvas API for no reason at all? Momma didn't raise no wimp.

Okay, there are *some* reasons I did what I did:

* ~~I am a coding masochist~~
* I wanted to build the gameboard and tiles as JavaScript objects rather than HTML elements, for more practice with object-oriented programming. More specifically,
    * I wanted more practice using JavaScript classes, particularly abstraction and encapsulation
    * I wanted to practice coding in the Revealing Module Design Pattern
* This is adapted from code I originally wrote when first learning JavaScript, before I got to CSS and HTML. The coding environment I was using at the time included the p5.js library, which is based on the Canvas API. Rather than embedding the library in my code (or using a hosted version), I've since converted this project to vanilla Canvas. I've also refactored the structure to not be quite such a hack job.

---

## Technical Overview

This project was built using HTML, CSS, and vanilla JavaScript. Game structure includes two classes to instantiate each gameboard and each tile, and two module objects to handle game logic and canvas operations.

The window load event calls an initialization task on the Gameboard class, which loads all available tile images from the assets folder. Promise fulfillment ensures that no attempts to draw tiles are made before images have completed loading. A new gameboard is then instantiated according to user-selected difficulty level, selecting the required number of images and randomly assigning each to two new instances of tile. A canvas of appropriate size is drawn, and the draw method called for each tile.

Click events are handled by the game logic module, which flips tiles, tracks previous guesses, and assesses win conditions. Because click events are detected on a canvas element representing the entire gameboard, rather than individual elements for each tile, the target tile is determined based on cursor location and gameboard dimensions. The gameboard instance, which stores tile information in a private array, can then be queried for the relevant tile info, encapsulating game data while facilitating interaction between different objects/modules in the program.

---

## Forward Work
### Imrovements in Responsive Design
This version does currently include some elements of responsive design, including media queries to resize text, a function to redraw the gameboard on a window resize event, and a function to adjust canvas resolution based on device pixel ratio. But while tile size is dynamically adjusted based on the user-selected level and the dimensions of their viewport, the gameboard's aspect ratio is currently fixed. Contents will get squished once viewport aspect ratio drops below around ~1.2:1, meaning this game is not yet optimized for mobile.

### Optimize for Mobile
This could include logic to invert the gameboard aspect ratio to better accommodate vertical screens. It may also require reworking the toolbar layout.

### Verify Browser Compatibility
I developed this code using Firefox, and I have superficially tested it in Chrome and Safari. Any browser compatibility "gotchas" I am yet unaware of will likely show up in either the CSS transitions, or methods on the Canvas API. I ran into several of those issues in development, generally with Firefox lacking support for some functionality.

### Optimize Asset Handling
The canvas will not draw until all images load, so the gameboard appears momentarily blank when the user first navigates to the page. All available images are initialized at once, so this pause only occurs once at window load and no further delays will occur if the game is reset or level is changed. However, there may be ways to mitigate the initialization delay: 
* One option may be to replace the PNG images with SVG files, which are lighter weight and infinitely scalable. 
* Production-level applications would use a CDN to handle images, rather than a local repository. This was not an option I considered for this small personal project, but it would optimize image delivery for size, format, and quality.

---

## Skills Practiced
* Revealing Module Pattern
* Object-Oriented Programming
    * Class elements: methods and fields, public and private, static and instance
    * Encapsulation, abstraction

---

## Challenges Encountered (and Solved)
* Asynchronicity of loading images, program attempting to draw before loading complete
* Blurry canvas due to high pixel density of retina display (Canvas API does not discern between "physical" and "virtual" pixels as CSS does)
* Variable scope and privacy (passing needed data between modules while otherwise limiting exposure)

---

## More on drawing and animating with Canvas API vs. CSS Styling

To be clear, there are applications in which Canvas might make more sense than CSS for drawing and animation. Based on the simplicity of a matching game, this probably wasn't one of them. But some factors to consider in other circumstances:
### Shape Complexity
If you're trying to use Canvas to draw any shape more complex than a rectangle, it can be a pain. But if you're trying to use HTML elements and CSS styling to draw complex shapes, it can get far uglier, requiring many rules to control border radii, pseudo-selectors, and transforms. I prefer Canvas for shapes.
### Performance
Manipulating the DOM is inefficient and resource-intensive because the browser has to reflow the content after every change. It is not optimized for creating dynamic user interfaces. In this particular application, it probably wouldn't be a big deal, given that there wouldn't be high traffic in creating and removing many elements, so it would mostly just involve event listeners and flip animations. But I tend to be reluctant to dynamically manipulate large quantities of DOM elements as part of my main functionality.
### Convenience
Simple animations from a known State A to a known State B are a piece of cake with CSS. Consider the dropTiles function I wrote to animate the win state in this game: for all the time I could've saved by throwing a few transitions with "ease-in" instead of a looping time-dependent equation of linear motion... well, I probably could've used that saved time to contemplate my life choices. But for more complex animations, CSS may not be up to the job.
### Accessibility
Because a canvas element is just a bitmap, content is not out-of-the-box compatible with accessibility tools like semantic HTML is. Pixels within a canvas element do not scale, and may become illegibly blurry with sceen magnification. Text is not compatible with screen readers by default, although workarounds to add alt text in other ways do exist.

---

## Credits

Images provided under CC BY 3.0 from https://game-icons.net by the following artists:
* Delapouite
* Lorc
* Skoll
* Caro Asercion

Icons provided open-source from http://fontawesome.io by Dave Gandy

---

Thanks for taking the time to stop by! Please consider reaching out with any comments, questions, suggestions to improve my code, or good jokes.