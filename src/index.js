(function(exports) {

  var IMAGE_SET_DATA_ATTRIBUTE_NAME = "data-lil-image-set";
  var IMAGE_SET_ATTRIBUTE_NAME = "lilImageSet";
  var FALLBACK_SRC_ATTRIBUTE_NAME = "lilFallbackSrc";
  var SPLIT_REGEXP = /\s*,+\s*/;
  var IMAGE_SET_REGEXP = /^\s*(.+)\s+(\d+)x\s+(\d+)px\s*$/i;

  // Helper function to determine if an element is visible on the page.
  function isVisible(node) {
    var topOfViewport = window.scrollY;
    var bottomOfViewport = topOfViewport + window.innerHeight;
    var topOfNode = node.offsetTop;
    var bottomOfNode = topOfNode + node.offsetHeight;
    var topIsVisible = topOfNode >= topOfViewport && topOfNode <= bottomOfViewport;
    var bottomIsVisible = bottomOfNode >= topOfViewport && bottomOfNode <= bottomOfViewport;
    return topIsVisible || bottomIsVisible;
  }

  // Helper function to determine an image"s src attribute value
  // based on the client"s pixel density and viewport width.
  // Expects image.imageSet to be sorted by devicePixelRatio then breakpoint
  // in ascending order.
  function determineSrc(image, devicePixelRatio, viewportWidth) {
    var src = image.imageSet.reduce(function(found, spec) {
      if (found) return found;
      var correctDevicePixelRatio = spec.devicePixelRatio >= devicePixelRatio;
      var correctBreakpoint = spec.breakpoint >= viewportWidth;
      if (correctDevicePixelRatio && correctBreakpoint) return spec.src;
      return found;
    }, null);
    return src || image.fallbackSrc;
  }

  // Helper function to render the correct images.
  function render(images) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var viewportWidth = window.innerWidth || 0;
    images.forEach(function(image) {
      // Do nothing if the image node is not visible.
      if (!isVisible(image.node)) return;
      // Set the correct src attribute on the image node.
      image.node.src = determineSrc(image, devicePixelRatio, viewportWidth);
    });
  }

  // Helper function to throttle a function call based on a duration.
  function throttle(fn, duration) {
    var lastReturn = null;
    var timeout = null;
    var args = [];
    return function() {
      args = Array.prototype.slice.call(arguments, 0);
      if (!timeout) {
        timeout = setTimeout(function() {
          lastReturn = fn.apply({}, args);
          timeout = null;
        }, duration);
      }
      return lastReturn;
    };
  }

  exports.lazyImageLoader = function(throttleDuration) {
    throttleDuration = throttleDuration || 300;
    // Get the images we want to lazy-load.
    var images = document.querySelectorAll("img[" + IMAGE_SET_DATA_ATTRIBUTE_NAME  + "]");
    images = Array.prototype.slice.call(images, 0);
    // Parse their metadata.
    // We don"t lazy-load the images with invalid meta-data.
    // i.e. We try not to fail at run-time.
    var parsedImages = images.reduce(function(acc, image) {
      var imageSet = image.dataset[IMAGE_SET_ATTRIBUTE_NAME]; 
      if (!imageSet) return acc;
      imageSet = imageSet.split(SPLIT_REGEXP);
      if (!imageSet.length) return acc;
      // This is where the majority of the parsing happens.
      imageSet = imageSet.reduce(function(acc, raw) {
        var match = raw.match(IMAGE_SET_REGEXP);
        if (!match) return acc;
        acc.push({
          src: match[1],
          devicePixelRatio: parseInt(match[2], 10),
          breakpoint: parseInt(match[3], 10)
        });
        return acc;
      }, []);
      // If no valid imageSet specs were parsed,
      // ignore the image.
      if (!imageSet.length) return acc;
      // Sort the imageSet by devicePixelRatio then breakpoint
      // in ascending order.
      imageSet.sort(function(a, b) {
        if (a.devicePixelRatio < b.devicePixelRatio) {
          return -1;
        } else if (a.devicePixelRatio > b.devicePixelRatio) {
          return 1;
        } else if (a.breakpoint < b.breakpoint) {
          return -1;
        } else if (a.breakpoint > b.breakpoint) {
          return 1;
        } else {
          return 0;
        }
      });
      // Add the image to the list of parsed images.
      acc.push({
        node: image,
        imageSet: imageSet,
        fallbackSrc: image.dataset[FALLBACK_SRC_ATTRIBUTE_NAME] || image.src || ''
      });
      return acc;
    }, []);
    // Bind render function to parsed images.
    var boundRender = render.bind(null, parsedImages);
    var throttledBoundRender = throttle(boundRender, throttleDuration);
    // Re-render on scroll.
    window.addEventListener("scroll", throttledBoundRender);
    // Re-render on resize.
    window.addEventListener("resize", throttledBoundRender);
    // First render.
    boundRender();
  };

})(window || exports || (module && module.exports) || {});
