/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import breakpointHoc from 'plugins/debugger/views/BreakpointHoc';
import SimpleBBox from 'plugins/ballerina/model/view/simple-bounding-box';
import HoverGroup from 'plugins/ballerina/graphical-editor/controller-utils/hover-group';
import Node from '../../../../../model/tree/node';
import './compound-statement-decorator.css';
import Breakpoint from '../decorators/breakpoint';
import { getComponentForNodeArray } from './../../../../diagram-util';
import ElseStatementDecorator from './else-statement-decorator';
import ArrowDecorator from '../decorators/arrow-decorator';

/**
 * Wraps other UI elements and provide box with a heading.
 * Enrich elements with a action box and expression editors.
 */
class IfStatementDecorator extends React.Component {

    /**
     * Initialize the block decorator.
     */
    constructor() {
        super();
        this.state = {
            active: 'hidden',
        };
    }
    /**
     * Handles click event of breakpoint, adds/remove breakpoint from the node when click event fired
     *
     */
    onBreakpointClick() {
        const { model } = this.props;
        const { isBreakpoint = false } = model;
        if (isBreakpoint) {
            model.removeBreakpoint();
        } else {
            model.addBreakpoint();
        }
    }

    /**
     * Call-back for when a new value is entered via expression editor.
     */
    onUpdate() {
        // TODO: implement validate logic.
    }

    /**
     * Render breakpoint element.
     * @private
     * @return {XML} React element of the breakpoint.
     */
    renderBreakpointIndicator() {
        const breakpointSize = 14;
        const { bBox } = this.props;
        const breakpointHalf = breakpointSize / 2;
        const pointX = bBox.getRight() - breakpointHalf;
        const { model: { viewState } } = this.props;
        const statementBBox = viewState.components['statement-box'];
        const pointY = statementBBox.y - breakpointHalf;
        return (
            <Breakpoint
                x={pointX}
                y={pointY}
                size={breakpointSize}
                isBreakpoint={this.props.isBreakpoint}
                onClick={() => this.props.onBreakpointClick()}
            />
        );
    }

    /**
     * Override the rendering logic.
     * @returns {XML} rendered component.
     */
    render() {
        const { bBox, title, expression, isBreakpoint, isDebugHit } = this.props;

        const model = this.props.model;
        const viewState = model.viewState;
        const titleH = this.context.designer.config.flowChartControlStatement.heading.height;
        const titleW = this.context.designer.config.flowChartControlStatement.heading.width;
        const decisionLabelH = this.context.designer.config.flowChartControlStatement.decision.height;
        const decisionLabelW = this.context.designer.config.flowChartControlStatement.decision.width;
        const decisionLabelRadius = this.context.designer.config.flowChartControlStatement.decision.radius;
        const statementBBox = viewState.components['statement-box'];
        const displayExpression = viewState.components.expression;
        const gapLeft = this.context.designer.config.flowChartControlStatement.gap.left;
        const gapTop = this.context.designer.config.flowChartControlStatement.padding.top;


        // Defining coordinates of the diagram
        //                     (x,y)
        //
        // (P1)                (P9)
        //                (P2)  |  (P3)        (P4)
        //                 [condition]--false---|
        // (P11)              \_|_/_____________| (statementBox)
        //                      |(p8)           |
        //                      |               |
        //                 true |               |
        //                    __|__ (p12)     __|__
        //                    a = 1;           a = 5;
        //                      |               |
        //  (P7)                 (p10)          |
        //                                      |
        //                  (P6) _______________| (P5)
        //                      |
        //
        // Defining coordinates for the title
        //           (p8)
        //            / \
        //          /     \
        // ------>[condition]--false---|
        //    (p2)  \     /  (p3)
        //            \ /
        //           (p9)

        const p1X = bBox.x - gapLeft;
        const p1Y = bBox.y + gapTop;

        const p2X = bBox.x - (titleW / 2);
        const p2Y = p1Y + (titleH / 2);

        const p3X = bBox.x + (titleW / 2);
        const p3Y = p2Y;

        const p4X = p1X + gapLeft + statementBBox.w;
        const p4Y = p2Y;

        const p5X = p4X;
        const p5Y = bBox.y + bBox.h;

        const p6X = bBox.x;
        const p6Y = p5Y;

        const p8X = bBox.x;
        const p8Y = p2Y + (titleH / 2);

        const p9X = p8X;
        const p9Y = p8Y - titleH;

        const p11X = p1X;
        const p11Y = p1Y + (titleH / 2);

        const p12X = p8X;
        const p12Y = p8Y + this.context.designer.config.flowChartControlStatement.heading.gap;

        const decisionTrueLabelPositionX = (p8X - (decisionLabelW / 2));
        const decisionTrueLabelPositionY = (((p8Y + p12Y) / 2) - (decisionLabelH / 2));
        const decisionFalseLabelPositionX = (p3X + 2);
        const decisionFalseLabelPositionY = (p3Y - (decisionLabelH / 2));
        const expressionPositionX = (bBox.x + (viewState.components.expression.w / 2)) + 18;
        const expressionPositionY = (p2Y + 22);

        this.conditionBox = new SimpleBBox(p2X, (p2Y - (this.context.designer.config.statement.height / 2)),
            statementBBox.w, this.context.designer.config.statement.height);

        let statementRectClass = 'statement-title-rect';
        if (isDebugHit) {
            statementRectClass = `${statementRectClass} debug-hit`;
        }

        const body = getComponentForNodeArray(this.props.model.body);
        const elseComp = model.elseStatement;
        return (
            <g
                ref={(group) => {
                    this.myRoot = group;
                }}
            >
                <polyline
                    points={`${p3X},${p3Y} ${p4X},${p4Y} ${p5X},${p5Y}`}
                    className='flowchart-background-empty-rect'
                />
                {(() => {
                    if (viewState.isLastPathLine) {
                        return (
                            <line
                                x1={p5X}
                                y1={p5Y}
                                x2={p6X}
                                y2={p6Y}
                                className='flowchart-background-empty-rect'
                            />
                        );
                    } else {
                        return (
                            <ArrowDecorator
                                start={{ x: p5X, y: p5Y }}
                                end={{ x: p6X, y: p6Y }}
                                classNameArrow='flowchart-action-arrow'
                                classNameArrowHead='flowchart-action-arrow-head'
                            />
                        );
                    }
                })()}
                <polyline
                    points={`${p2X},${p2Y} ${p8X},${p8Y} ${p3X},${p3Y} ${p9X}, ${p9Y} ${p2X},${p2Y}`}
                    className={statementRectClass}
                />
                <text
                    x={p8X}
                    y={p2Y}
                    className='statement-title-text'
                >
                    if
                </text>
                {expression &&
                    <text
                        x={expressionPositionX}
                        y={expressionPositionY}
                        className='condition-text'
                    >
                        {displayExpression.text}
                    </text>
                }
                <rect
                    x={decisionTrueLabelPositionX}
                    y={decisionTrueLabelPositionY}
                    width={decisionLabelW}
                    height={decisionLabelH}
                    rx={decisionLabelRadius}
                    ry={decisionLabelRadius}
                    className='flowchart-true-text-bg'
                />
                <text
                    x={p8X + 12}
                    y={((p8Y + p12Y) / 2) + 4}
                    className='flowchart-true-text'
                >
                    true
                </text>
                <rect
                    x={decisionFalseLabelPositionX}
                    y={decisionFalseLabelPositionY}
                    width={decisionLabelW}
                    height={decisionLabelH}
                    rx={decisionLabelRadius}
                    ry={decisionLabelRadius}
                    className='flowchart-false-text-bg'
                />
                <text
                    x={p3X + 8}
                    y={p3Y + 4}
                    className='flowchart-false-text'
                >
                    false
                </text>
                <HoverGroup model={this.props.model} region='actionBox'>
                    <g>
                        <rect
                            x={p2X}
                            y={p9Y}
                            width={titleW}
                            height={titleH}
                            className='invisible-rect'
                        />
                        {expression && <title> {expression.text} </title>}
                    </g>
                </HoverGroup>
                {isBreakpoint && this.renderBreakpointIndicator()}
                {this.props.children}
                {body}
                {elseComp && <ElseStatementDecorator
                    dropTarget={model}
                    bBox={elseComp.viewState.bBox}
                    title={'else'}
                    model={elseComp}
                    body={elseComp}
                />}
                <HoverGroup model={this.props.model} region='main'>
                    <rect
                        x={p6X - 25}
                        y={p6Y - 25}
                        width={50}
                        height={25}
                        className='invisible-rect'
                    />
                </HoverGroup>
                {elseComp && <HoverGroup model={elseComp} region='main'>
                    <rect
                        x={p5X - 25}
                        y={p6Y - 20}
                        width={50}
                        height={30}
                        className='invisible-rect'
                    />
                </HoverGroup>}
            </g>);
    }
}

IfStatementDecorator.defaultProps = {
    draggable: null,
    children: null,
    undeletable: false,
    editorOptions: null,
    parameterEditorOptions: null,
    utilities: null,
    parameterBbox: null,
    disableButtons: {
        debug: false,
        delete: false,
        jump: false,
    },
    disableDropzoneMiddleLineOverlay: false,
    isDebugHit: false,
};

IfStatementDecorator.propTypes = {
    title: PropTypes.string.isRequired,
    model: PropTypes.instanceOf(Node).isRequired,
    children: PropTypes.arrayOf(PropTypes.node),
    bBox: PropTypes.instanceOf(SimpleBBox).isRequired,
    expression: PropTypes.shape({
        text: PropTypes.string,
    }).isRequired,
    onBreakpointClick: PropTypes.func.isRequired,
    isBreakpoint: PropTypes.bool.isRequired,
    isDebugHit: PropTypes.bool,
};

IfStatementDecorator.contextTypes = {
    getOverlayContainer: PropTypes.instanceOf(Object).isRequired,
    environment: PropTypes.instanceOf(Object).isRequired,
    editor: PropTypes.instanceOf(Object).isRequired,
    mode: PropTypes.string,
    designer: PropTypes.instanceOf(Object),
};

export default breakpointHoc(IfStatementDecorator);
