# Lazy Image Loader

Lazy Image Loader is a tiny JavaScript library intended to be used in web browsers.
It enables developers to build websites that defer the loading of off-screen images using standard `<img>` tags.
It does this by listening to the browser `window`'s scroll and resize events.

Developers can also configure `<img>` tags to be responsive using this library by specifying different images to
be loaded depending on a client device's pixel density and viewport width.

This library has no dependencies and is ~1kb minified.

## Download this library

- [Latest minified version](https://raw.githubusercontent.com/dhruvio/js_lazy-image-loader/master/build/lazy-image-loader.min.js)
- [Latest unminified version](https://raw.githubusercontent.com/dhruvio/js_lazy-image-loader/master/build/lazy-image-loader.js)

## Usage

The code snippet below shows you how this library can be used in practice:

```html
<!-- inside the body tag -->
<!-- configure and img tag with the correct data attributes -->
<img src="/placeholder.jpg" data-lil-image-set="/mobile-image.jpg 2x 480px, /tablet-image.jpg 2x 1100px, /laptop-image.jpg 2x 1440px" data-lil-fallback-src="/desktop-image.jpg" />
<!-- load the Lazy Image Loader library -->
<script src="/path/to/lazy-image-loader.min.js"></script>
<!-- start the Lazy Image Loader -->
<script>lazyImageLoader();</script>
```

### Configuring `<img>` tags

```html
<img src="/placeholder.jpg" data-lil-image-set="/mobile-image.jpg 2x 480px, /tablet-image.jpg 2x 1100px, /laptop-image.jpg 2x 1440px" data-lil-fallback-src="/desktop-image.jpg" />
```

Set the `src`, `data-lil-image-set` and `data-lil-fallback-src` attributes on `<img>` tags to properly configure them to be lazy-loaded.

#### `src`

The `src` attribute acts as a placeholder image.
This image will be loaded and displayed to users by default, so it is recommended to use an image with a small size.

#### `data-lil-image-set`

The `data-lil-image-set` attribute specifies the various image that should be loaded with the `<img>` tag is on-screen (i.e. scrolled or resized into view).
This attribute is the selector used by this library to determine which images should be lazy-loaded.

The value of this attribute must follow the format described in the snippet above. That is, it must be a comma-separated list of "specifications."
Each "specification" must have three sections:

1. The image source (e.g. `/mobile-image.jpg`);
2. The maximum pixel density it supports (e.g. `2x`); and
3. The maximum viewport width it supports (e.g. `480px`).

In other words, each specification must conform to the following format: `<IMAGE_SRC> <DENSITY_INT>x <MAX_VIEWPORT_PX_INT>px`.
Note the `x` after the `DENSITY_INT` and the `px` after the `MAX_VIEWPORT_PX_INT`.

This library sorts each specification in the image set by pixel density first and maximum viewport width second, in ascending order.
Then, when an image appears on-screen, it uses the first specification that matches the client's pixel density and viewport width.
A "matching" specification is one whose pixel density and maximum viewport width are equal to or greater than the client's actual
pixel density and viewport width.
For example, using the above snippet as an example, if the client's pixel density is `1x` and viewport width is `800px`, this library
would load the `/tablet-image.jpg` image.

#### `data-lil-fallback-src`

The `data-lil-fallback-src` attribute is an optional attribute that specifies the fallback image source that should be used if
none of the specifications in `data-lil-image-set` match the client's pixel density and viewport width.
In practice, it is recommended to always specify a value for this attribute, and for it to be the highest resolution image available.

Using the above code snippet as an example, if the client's pixel density is greater than `2x` or viewport width is greater than `1440px`,
this library would load `/desktop-image.jpg` since none of the image set's specifications match the client.

If this attribute is not defined, the `<img>` tag's original `src` attribute is used as the fallback image source.

### Other usage notes

This library does its best to "work" without causing run-time exceptions.
Consequently, if a `data-lil-image-set` attribute is specified incorrectly, this library will ignore the `<img>` tag associated with it and not lazy-load it.

## Copyright & Author

This library is published under the MIT License.

&copy; Dhruv Dang  
[dhruv@realfolk.io](mailto:dhruv@realfolk.io)
