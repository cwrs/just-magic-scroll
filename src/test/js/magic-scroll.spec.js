/*eslint-env node, mocha */

import ReactTestUtils from 'react-addons-test-utils';
import expect from 'expect';
import expectElement from 'expect-element';
expect.extend(expectElement);

import { MagicScroll } from 'magic-scroll.jsx';

describe('MagicScroll component test', () => {

    const defaultProps = {

        itemHeight: 50,
        itemCount: 20,
        rowFunction: (index) => { return (<div key={index}>index</div>) },
        fetch: () => { }
    }

    function renderMagicScroll(props = {}) {
        const validProps = Object.assign({}, defaultProps, props);
        const result = ReactTestUtils.renderIntoDocument(
            <MagicScroll {...validProps}/>
        );
        return ReactTestUtils.findRenderedComponentWithType(result, MagicScroll);
    }

    it('should render', () => {
        expect(renderMagicScroll()).toBeA(MagicScroll);
    });

});
