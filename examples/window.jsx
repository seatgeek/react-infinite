var ListItem = React.createClass({
    getDefaultProps: function() {
        return {
            height: 50,
            lineHeight: "50px"
        }
    },
    render: function() {
        return <div className="infinite-list-item" style={
            {
                height: this.props.height,
                lineHeight: this.props.lineHeight,
                overflow: 'scroll'
            }
        }>
            <div style={{height: 400}}>
                List Item {this.props.index}
            </div>
        </div>;
    }
});

var InfiniteList = React.createClass({
    getInitialState: function() {
        return {
            elements: this.buildElements(0, 50),
            isInfiniteLoading: false
        }
    },

    buildElements: function(start, end) {
        var elements = [];
        for (var i = start; i < end; i++) {
            elements.push(<ListItem key={i} index={i}/>)
        }
        return elements;
    },

    handleInfiniteLoad: function() {
        var that = this;
        this.setState({
            isInfiniteLoading: true
        });
        setTimeout(function() {
            var elemLength = that.state.elements.length,
                newElements = that.buildElements(elemLength, elemLength + 100);
            that.setState({
                isInfiniteLoading: false,
                elements: that.state.elements.concat(newElements)
            });
        }, 2500);
    },

    elementInfiniteLoad: function() {
        return <div className="infinite-list-item">
            Loading...
        </div>;
    },

    render: function() {
        return <Infinite elementHeight={50}
                         containerHeight={window.innerHeight}
                         infiniteLoadBeginBottomOffset={200}
                         onInfiniteLoad={this.handleInfiniteLoad}
                         loadingSpinnerDelegate={this.elementInfiniteLoad()}
                         isInfiniteLoading={this.state.isInfiniteLoading}
                         timeScrollStateLastsForAfterUserScrolls={1000}
                         >
                    {this.state.elements}
                </Infinite>;
    }
});

React.render(<InfiniteList/>,
        document.getElementById('infinite-window-example'));
