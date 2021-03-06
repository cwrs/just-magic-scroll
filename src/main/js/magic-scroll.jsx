import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * wrapper used to throttle scroll and resize events which fire at a very high rate and would produce a lot of useless
 * recalculations
 *
 * in testing code this wrapper simply returns the argument
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/scroll
 *
 * @param {function} handler handler to wrap
 * @return {*} the wrapped handler
 */
function throttleEvents(handler) {
    if (!window || !window.requestAnimationFrame) {
        return handler;
    }
    let free = true;
    return () => {
        if (free) {
            window.requestAnimationFrame(() => {
                handler();
                free = true;
            });
        }
        free = false;
    };
}

/**
 * The MagicScroll component can be used to put elements in DOM only if they are inside the view port. It reacts on
 * scroll and resize events and calculates on demand which children are visible.
 * The children need to have all the same height so this component can calculate the vertical position.
 *
 * inspired by: https://clusterize.js.org/
 */
export class MagicScroll extends Component {

    constructor(props) {
        super(props);
        this.state = {
            start: 0,
            end: Math.ceil(2000 / this.props.itemHeight)
        };
        this.updateEvent = throttleEvents(this.updateEvent.bind(this));
        this.setScrollContainer = (element) => {
            this.magicScrollContainer = element
        };
    }

    componentDidMount() {
        if (!window) {
            return;
        }
        this.scrollableAncestor = this.findScrollableAncestor();
        this.scrollableAncestor.addEventListener('scroll', this.updateEvent);
        window.addEventListener('resize', this.updateEvent);
        this.update(this.props);
    }

    componentWillUnmount() {
        if (!window) {
            return;
        }

        if (this.scrollableAncestor) {
            //At the time of unmounting, the scrollable ancestor might no longer
            //exist. Guarding against this prevents the following error:
            //Cannot read property 'removeEventListener' of undefined
            this.scrollableAncestor.removeEventListener('scroll', this.updateEvent);
        }
        window.removeEventListener('resize', this.updateEvent);
    }

    componentWillReceiveProps(nextProps) {
        this.update(nextProps);
    }

    scrollToTop() {
        if (this.scrollableAncestor) {
            this.scrollableAncestor.scrollTop = 0;
        }
    }

    /**
     * Traverses up the DOM to find an ancestor container which has an overflow
     * style that allows for scrolling.
     *
     * @return {Object} the closest ancestor element with an overflow style that
     *   allows for scrolling. If none is found, the `window` object is returned
     *   as a fallback.
     */
    findScrollableAncestor() {
        let node = this.magicScrollContainer;

        while (node.parentNode) {
            node = node.parentNode;

            //This particular node does not have a computed style or does not have a scroll bar, it uses the window.
            if (node !== document && node !== document.documentElement) {
                const style = window.getComputedStyle(node);
                const overflowY = style.getPropertyValue('overflow-y') || style.getPropertyValue('overflow');

                if (overflowY === 'auto' || overflowY === 'scroll') {
                    return node;
                }
            }
        }

        //A scrollable ancestor element was not found, which means that we need to do stuff on window.
        return window;
    }

    getViewPortHeight() {
        const scrollableAncestor = this.scrollableAncestor || window;
        if (scrollableAncestor === window) {
            //transform to integer so 0 is returned instead of NaN
            return window.innerHeight | 0;
        }
        return scrollableAncestor
            ? scrollableAncestor.offsetHeight | 0
            : 0;
    }

    updateEvent() {
        this.update(this.props);
    }

    getRelativeViewPortStart() {
        const scrollableAncestor = this.scrollableAncestor || window;
        //if the scrollbar scrolls the window directly or the scrollableAncestor scrolls relativly to the body
        if (scrollableAncestor === window || scrollableAncestor.offsetParent === document.body) {
            return this.magicScrollContainer
                ? -this.magicScrollContainer.getBoundingClientRect().top
                : 0;
        }
        //the scrollbar scrolls a single container
        return scrollableAncestor.scrollTop;
    }

    update(props) {
        const { itemCount, fetch, itemHeight } = props;
        const numberOfElementsInViewPort = Math.ceil(this.getViewPortHeight() / itemHeight);

        const relativeViewPortStart = this.getRelativeViewPortStart();
        const topElementsHidden = Math.ceil(relativeViewPortStart / itemHeight);

        const start = Math.max(0, topElementsHidden - 1);
        const end = Math.min(itemCount, topElementsHidden + numberOfElementsInViewPort + 1);
        this.setState({
            start,
            end
        });
        fetch(start, end);
    }


    render() {
        const { itemCount, itemHeight, rowFunction } = this.props;
        const { start, end } = this.state;


        const visibleItems = [];

        for (let index = start; index < end; index += 1) {
            visibleItems.push(rowFunction(index));
        }

        return (
            <div className={this.props.className}
              ref={this.setScrollContainer}
              style={{
                  height: `${itemCount * itemHeight}px`,
                  position: 'relative'
              }}>
                <div style={{
                    position: 'absolute',
                    top: `${start * itemHeight}px`,
                    width: '100%'
                }}>
                    {visibleItems}
                </div>
            </div>
        );
    }

}

MagicScroll.propTypes = {

    /**
     * the height of a single element
     */
    itemHeight: PropTypes.number.isRequired,

    /**
     * the amount of wrapped elements
     */
    itemCount: PropTypes.number.isRequired,

    /**
     * a function to get a specific element by its index
     */
    rowFunction: PropTypes.func.isRequired,

    /**
     * a function to trigger the load of the viewport, parameters are start and end (excluding) of the current viewed
     * page
     */
    fetch: PropTypes.func.isRequired,

    /**
     * the className which is added to the magic scoller
     */
    className: PropTypes.string

};

export default MagicScroll;
