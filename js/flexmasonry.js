const defaultOptions = {
    /*
     * If `responsive` is `true`, `breakpointCols` will be used to determine
     * how many columns a grid should have at a given responsive breakpoint.
     */
    responsive: true,
    /*
     * A list of how many columns should be shown at different responsive
     * breakpoints, defined by media queries.
     */
    breakpointCols: {
        'min-width: 1500px': 6,
        'min-width: 1200px': 5,
        'min-width: 992px': 4,
        'min-width: 768px': 3,
        'min-width: 576px': 2,
    },
    /*
     * If `responsive` is `false`, this number of columns will always be shown,
     * no matter the width of the screen.
     */
    numCols: 4,
    /**
     * If `gap` is specified, this amount in px will be between the columns/row
     */
    gap: 0,
};

let _resizeId = null;
let _options = {};
let _targets = [];

function FlexMasonryinit(targets, options = {}) {
    if (typeof targets === 'string') {
        _targets = document.querySelectorAll(targets);
    } else {
        _targets = targets;
    }

    _options = Object.assign(defaultOptions, options);

    _targets.forEach(function(target) {
        FlexMasonrysetUp(target);
        FlexMasonrysetHeight(target);
    });

    FlexMasonryaddEventListeners();

    return this;
}

function FlexMasonrysetUp(target) {
    target.classList.add('flexmasonry');

    if (_options.responsive) {
        target.classList.add('flexmasonry-responsive');
    }

    FlexMasonrysetColsClass(target);

    Array.from(target.children).forEach(function(item) {
        item.classList.add('flexmasonry-item');
    });

    FlexMasonryaddBreakElements(target);
}

function FlexMasonryonLoad() {
    _targets.forEach(function(target) {
        FlexMasonrysetHeight(target);
    });
}

function FlexMasonryonResize() {
    if (_resizeId) {
        window.cancelAnimationFrame(_resizeId);
    }

    _resizeId = window.requestAnimationFrame(function() {
        FlexMasonryrefreshAll();
    });
}

function FlexMasonryaddEventListeners() {
    window.addEventListener('load', FlexMasonryonLoad);
    window.addEventListener('resize', FlexMasonryonResize);
}

function FlexMasonryremoveEventListeners() {
    window.removeEventListener('load', FlexMasonryonLoad);
    window.removeEventListener('resize', FlexMasonryonResize);
}

function FlexMasonrysetHeight(target) {
    if (FlexMasonrygetCurrentCols() < 2) {
        target.style.removeProperty("height");
        Array.from(target.children).forEach(function FlexMasonry(item) {
            item.style.removeProperty("width");
        });
        return;
    }

    let heights = [];

    Array.from(target.children).forEach(function(item) {
        if (!!_options.gap) {
            item.style.padding = `${_options.gap}px`;
            item.style.width = `${100 / FlexMasonrygetCurrentCols()}%`;
        }
        if (item.classList.contains('flexmasonry-break')) {
            return;
        }

        const comp   = window.getComputedStyle(item);
        const order  = comp.getPropertyValue('order');
        const height = comp.getPropertyValue('height');

        if (!heights[order - 1]) {
            heights[order - 1] = 0;
        }
        heights[order - 1] += Math.ceil(parseFloat(height));
    });

    const maxHeight = Math.max(...heights);
    target.style.height = maxHeight + 'px';
}

function FlexMasonryaddBreakElements(target) {
    const breakEls = target.querySelectorAll('.flexmasonry-break');
    if (Array.from(breakEls).length === (FlexMasonrygetCurrentCols() - 1)) {
        return;
    }

    for (let i = 1; i < FlexMasonrygetCurrentCols(); i++) {
        const breakDiv = document.createElement('div');
        breakDiv.classList.add('flexmasonry-break');
        breakDiv.classList.add('flexmasonry-break-' + i);
        target.appendChild(breakDiv);
    }
}

function FlexMasonryremoveBreakElements(target) {
    const breakEls = target.querySelectorAll('.flexmasonry-break');
    if (Array.from(breakEls).length === (FlexMasonrygetCurrentCols() - 1)) {
        return;
    }

    Array.from(breakEls).forEach(function(breakEl) {
        breakEl.parentNode.removeChild(breakEl);
    });
}

function FlexMasonrysetColsClass(target) {
    if (target.classList.contains('flexmasonry-cols-' + FlexMasonrygetCurrentCols())) {
        return;
    }

    target.className = target.className.replace(/(flexmasonry-cols-\d+)/, '');
    target.classList.add('flexmasonry-cols-' + FlexMasonrygetCurrentCols());
}

function FlexMasonrygetCurrentCols() {
    if (!_options.responsive) {
        return _options.numCols;
    }

    const keys = Object.keys(_options.breakpointCols);
    for (const key of keys) {
        if (window.matchMedia('(' + key + ')').matches) {
            return _options.breakpointCols[key];
        }
    }

    return 1;
}

function FlexMasonryrefresh(target, options = {}) {
    _options = Object.assign(defaultOptions, options);

    FlexMasonrysetColsClass(target);
    FlexMasonryremoveBreakElements(target);
    FlexMasonryaddBreakElements(target);
    FlexMasonrysetHeight(target);

    return this;
}

function FlexMasonryrefreshAll(options = {}) {
    _targets.forEach(function(target) {
        FlexMasonryrefresh(target, options);
    });

    return this;
}

function FlexMasonrydestroyAll() {
    FlexMasonryremoveEventListeners();
}
