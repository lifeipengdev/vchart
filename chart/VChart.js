/***
 * Author : lifeipengdev@icloud.com
 * Time : 2013-9-15
 * **/

(function(glob, R)
{
    var VC = function(){},
        elProp = {},
        hLayout = "HBoxLayout",
        vLayout = "VBoxLayout",
        defaultColors = (function()
        {
            var colors = [];
            var index = 0;
            for(var i = 0; i < 50; i++)
            {
                colors.push(R.hsb(index, 0.75, 1));
                index += 0.1;
            }
            return colors;
        })(),
        trace = function(msg)
        {
            try
            {
                console.log(msg);
            }catch(e){}
        },
        /**
         * SVG指令
         M	moveto	(x y)+
         Z	closepath	(none)
         L	lineto	(x y)+
         H	horizontal lineto	x+
         V	vertical lineto	y+
         C	curveto	(x1 y1 x2 y2 x y)+
         S	smooth curveto	(x2 y2 x y)+
         Q	quadratic Bézier curveto	(x1 y1 x y)+
         T	smooth quadratic Bézier curveto	(x y)+
         A	elliptical arc	(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
         * */
        M = "M", Z = "Z", L = "L",
        H = "H", V = "V", C = "C",
        S = "S", Q = "Q", T = "T",
        A = "A";

    //扩展Element元素
    R.el.isSelected = false;
    R.el.prop = function(key, value)
    {
        elProp[this.id] = elProp[this.id] || {};
        if(arguments.length == 0)
        {
            return elProp[this.id];
        }
        else if(arguments.length == 1)
        {
            if(R.is(key, "object"))
            {
                for(var i in key)
                {
                    if(key.hasOwnProperty(i))
                    {
                        this.prop(i, key[i]);
                    }
                }
                return this;
            }
            return elProp[this.id][key];
        }
        elProp[this.id][key] = value;
        //返回对element的指向
        return this;
    };

    //计算文字的长度
    function calcTextWidth(text, options)
    {

    }

    //数据源转换对象
    var dataAnalysis = function(sources, categoryField, graphType)
    {
        var i = 0, k,
            min = 0, max = 0,
            orgSources = sources,
            len = sources.length,
            categorySources = [],
            graphItems = {},
            itemCount = 0,
            total = 0;

        graphType = graphType || "Default";

        for(i = 0; i < len; i++)
        {
            var item = sources[i];
            total = 0;
            categorySources.push(item[categoryField]);
            for(k in item)
            {
                if(k == categoryField)continue;
                var val = item[k];
                if(!graphItems[k])
                {
                    graphItems[k] = {};
                    graphItems[k].label = k;
                    graphItems[k].value = [];
                    itemCount++;
                }
                graphItems[k].value.push(val);
                if(graphType == "Default")
                {
                    if(val < min)min = val;
                    else if(val > max)max = val;
                }
                else
                {
                    total += val;
                }
            }
            if(graphType != "Default")
            {
                if(total < min)min = total;
                else if (total > max)max = total;
            }
        }

        return {
            getCategorySources : function()
            {
                return categorySources;
            },
            getMax : function()
            {
                return max;
            },
            getMin : function()
            {
                return min;
            },
            getGraphItems : function()
            {
                return graphItems;
            },
            getItemCount : function()
            {
                return itemCount;
            }
        };
    };

    //图标的纵轴
    var Axis = function(configs)
    {
        var paper = configs.paper,
            options = updateOptions(configs),
            _min = 0, _max = 0, _total = 0,
            points = [];

        function updateOptions(configs)
        {
            options = options || {};
            for(var key in configs)
            {
                if(configs[key] != undefined)
                {
                    options[key] = configs[key];
                }
            }
            return options;
        }

        function getTotal()
        {
            return _total;
        }

        function getMin()
        {
            return _min;
        }

        function getMax()
        {
            return _max;
        }

        function getPoints()
        {
            return points;
        }

        function draw()
        {
            var cx = options.cx,
                cy = options.cy,
                h = options.h,
                w = options.w,
                i = 0,
                unit = options.unit,
                //轴的方向
                direction = options.direction || "Ver",
                //像素值
                minInterval = options.interval || 50,
                start = 0,
                count = 0,
                interval = 0;;

            _min = options.min;
            _max = options.max;
            _total = Math.abs(_max - _min);
            if(direction == "Ver")
            {
                count = h / minInterval + 1;
                interval = Math.round(_total / (count - 1));
                paper.path([M, cx, cy - 1, L, cx, cy + h + 1]).attr({
                    stroke : "#fff",
                    "stroke-width" : 3
                });

                var yPos = cy;
                start = _max;
                for(i = count - 1; i >= 0; i--)
                {
                    points[i] = yPos;
                    paper.text(cx - 10, yPos, start + " "+unit).attr({
                        fill : "#fff",
                        "font-size" : 12,
                        "text-anchor" : "end"
                    });
                    start -= interval;
                    if(start < _min)start = _min;
                    yPos += minInterval;
                }
            }
            else
            {
                count = w / minInterval + 1;
                interval = Math.round(_total / (count - 1));
                paper.path([M, cx, cy, L, cx + w, cy]).attr({
                    stroke : "#fff",
                    "stroke-width" : 3
                });
                var xPos = cx;
                start = _min;
                for(i = 0; i < count; i++)
                {
                    points[i] = xPos;
                    paper.text(xPos, cy + 15, start + " "+unit).attr({
                        fill : "#fff",
                        "font-size" : 12,
                        "text-anchor" : "end"
                    });
                    start += interval;
                    if(start > _max)start = _max;
                    xPos += minInterval;
                }
            }

        }

        return {draw : draw, updateOptions: updateOptions,
                 getTotal : getTotal, getMin : getMin, getMax : getMax, getPoints : getPoints};
    };

    //图表的横轴
    var CategoryAxis = function(configs)
    {
        var paper = configs.paper,
            options = updateOptions(configs),
            points = [];

        function updateOptions(configs)
        {
            options = options || {};
            for(var key in configs)
            {
                if(configs[key] != undefined)
                {
                    options[key] = configs[key];
                }
            }
            return options;
        }

        function getPoints()
        {
            return points;
        }

        function draw()
        {
            var cx = options.cx,
                cy = options.cy,
                direction = options.direction || "Hor",
                w = options.w,
                h = options.h,
                i = 0,
                sources = options.sources,
                len = sources.length,
                defaultInterval = 0,
                interval = 0,
                pos = 0;

            if(direction == "Hor")
            {
                defaultInterval = w / (len - 1);
                interval = (w - defaultInterval) / (len - 1);
                pos = cx + defaultInterval / 2;
                paper.path([M, cx, cy, L, cx + w, cy]).attr({
                    stroke : "#fff",
                    "stroke-width" : 3
                });

                for(i = 0; i < len; i++)
                {
                    points.push(pos);
                    paper.text(pos, cy + 15, sources[i]).attr({
                        fill : "#fff",
                        "font-size" : 12
                    });
                    pos += interval;
                }
            }
            else
            {
                defaultInterval = h / (len - 1);
                interval = (h - defaultInterval) / (len - 1);
                pos = cy + defaultInterval / 2;
                paper.path([M, cx, cy, L, cx, cy + h]).attr({
                    stroke : "#fff",
                    "stroke-width" : 3
                });
                for(i = 0; i < len; i++)
                {
                    points.push(pos);
                    paper.text(cx - 10, pos, sources[i]).attr({
                        fill : "#fff",
                        "font-size" : 12,
                        "text-anchor" : "end"
                    });
                    pos += interval;
                }
            }
        }

        return { draw: draw, getPoints : getPoints }
    };

    /**
     * 坐标点对象
     * */
    VC.Point = function()
    {
        return { x: 0, y: 0}
    };
    //计算两点之间的距离
    VC.Point.distance = function(p1, p2)
    {
        var xDistance = p1.x - p2.x,
            yDistance = p1.y - p2.y;
        return Math.pow((xDistance * xDistance + yDistance * yDistance), 0.5);
    };
    //计算两个点的斜率
    VC.Point.slope = function(p1, p2)
    {
        return Math.atan2((p1.y - p2.y), (p1.x - p2.x));
    };

    /**
     * 图例对象
     * */
    VC.legend = function(dom, configs)
    {
        var paper = R(dom),
            options = updateOptions(configs),
            host = configs.host,
            items = paper.set();

        function updateOptions(configs)
        {
            options = options || {};
            for(var key in configs)
            {
                if(configs[key] != undefined)
                {
                    options[key] = configs[key];
                }
            }
            return options;
        }

        function clear()
        {
            paper.clear();
            items = paper.set();
            return this;
        }

        function draw()
        {
            clear();
            var layout = options.layout || vLayout,
                size = options.size || 20,
                gap = options.gap || 10,
                targets = host.getItems(),
                xpos = 0, ypos = 0,
                align = options.align || "start",
                fontSize = options.fontSize || 12,
                fontColor = options.fontColor || "#fff";


            for(var i = 0; i < targets.length; i++)
            {
                var block,
                    label,
                    target = targets[i],
                    data = target.data("source"),
                    color = target.prop("color");

                if(layout == vLayout)
                {
                    ypos += size + gap;
                }

                block = paper.rect(xpos, ypos, size, size).attr({
                    fill : color
                });
                label = paper.text(xpos + size + 5, ypos + size / 2, data.label).attr({
                    fill : fontColor,
                    "font-size" : fontSize,
                    "text-anchor" : align
                });
                items.push(block);
                items.push(label);
            }

            return this;
        }

        function updateHost(val)
        {
            host = val;
        }

        return { draw : draw , updateOptions : updateOptions, updateHost : updateHost };
    };

    /**
     * 饼图组件
     * */
    VC.pieChart = function(dom, configs)
    {
        var paper = R(dom),
            options = updateOptions(configs),
            sources = updateData(configs.sources),
            rad = Math.PI / 180,
            items = paper.set(),
            slices = [],
            labels = [];


        function clear()
        {
            paper.clear();
            items = paper.set();
            slices = [];
            labels = [];
        }

        function draw()
        {
            clear();
            var angle = 0,
                total = 0,
                start = 0,
                cx = options.cx,
                cy = options.cy,
                r = options.r,
                fillColors = options.fillColors || defaultColors,
                stroke = options.stroke || "#fff",
                strokeWidth = options.strokeWidth || 3,
                popDistance = options.popDistance || 20,
                process = function(i)
                {
                    var value = sources[i].value,
                        label = sources[i].label,
                        anglePlus = 360 * value / total,
                        popAngle = angle + (anglePlus / 2),
                        popX = cx + popDistance * Math.cos(-popAngle * rad),
                        popY = cy + popDistance * Math.sin(-popAngle * rad),
                        initPath = calcPath(cx, cy, r, angle, anglePlus + angle),
                        popPath = calcPath(popX, popY, r, angle, anglePlus + angle),
                        color = fillColors[i],
                        ms = 500,
                        self = this,
                        p = paper.path(initPath).attr({
                            fill : color,
                            stroke : stroke,
                            title : label,
                            "stroke-width" : strokeWidth
                        }).data({
                            source : sources[i]
                        }).prop({
                            initPath : initPath,
                            popPath : popPath,
                            popX : popX,
                            popY : popY,
                            color : color
                        }),
                        txt = paper.text();

                    function popHandler(ele)
                    {
                        //是否只允许一次弹出一个饼块
                        var popSingle = options.popSingle == undefined ? true : options.popSingle;
                        if(popSingle)
                        {
                            ele.isSelected ? selectSlice(ele) : unSelectSliece(ele);
                            for(var key in slices)
                            {
                                if(ele.id != slices[key].id && slices[key].isSelected == true)
                                {
                                    unSelectSliece(slices[key]);
                                }
                            }
                        }
                        else
                        {
                            ele.isSelected ? selectSlice(ele) : unSelectSliece(ele);
                        }
                    }

                    function selectSlice(ele)
                    {
                        ele.isSelected = true;
                        ele.stop().animate({path : ele.prop("popPath")}, ms);
                    }

                    function unSelectSliece(ele)
                    {
                        ele.isSelected = false;
                        ele.stop().animate({path : ele.prop("initPath")}, ms);
                    }

                    p.mousedown(function()
                    {
                        p.isSelected = !p.isSelected;
                        popHandler(p);
                    });


                    angle += anglePlus;
                    items.push(p);
                    slices.push(p);
                    items.push(txt);
                    labels.push(txt);
                };

            var i = 0, ii = sources.length;
            for(i = 0; i < ii; i++)
            {
                total += sources[i].value;
            }
            for(i = 0; i < ii; i++)
            {
                process(i);
            }

        }

        function calcPath(cx, cy, r, startAngle, endAngle)
        {
            var x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad);

            return [M, cx, cy,
                    L, x1, y1,
                    A, r, r, 0, +(endAngle - startAngle > 180), 0,
                    x2, y2, Z];
        }

        function updateOptions(configs)
        {
            options = options || {};
            for(var key in configs)
            {
                if(configs[key] != undefined)
                {
                    options[key] = configs[key];
                }
            }
            return options;
        }

        function updateData(vals)
        {
            sources = vals;
            return sources;
        }

        function getItems()
        {
            return slices;
        }

        return {
                draw : draw, updateOptions : updateOptions,
                updateData : updateData, getItems : getItems
        };

    };

    /**
     * 线图组件
     * */
    VC.lineChart = function(dom, configs)
    {
        var paper = R(dom),
            items = paper.set(),
            options = updateOptions(configs),
            sources = updateData(configs.sources),
            points = {},
            lines = [];

        function updateOptions(configs)
        {
            options = options || {};
            for(var key in configs)
            {
                if(configs[key] != undefined)
                {
                    options[key] = configs[key];
                }
            }
            return options;
        }

        function updateData(val)
        {
            sources = val;
            return sources;
        }

        function getItems()
        {
            return lines;
        }

        function clear()
        {
            paper.clear();
            items = paper.set();
            lines = [];
            points = [];
        }

        function draw()
        {
            clear();
            var cx = options.cx || 0,
                cy = options.cy || 0,
                max = 0, min = 0, i = 0, k = 0,
                len = sources.length,
                unit = options.unit || "",
                categoryField = options.categoryField,
                categorySource = [],
                verInterval = 0, horInterval = 0,
                cmd = M, total = 0,
                verPoints = [], horPoints = [],
                graphType = options.graphType || "Curve",
                //距离横向边缘的距离,左侧和右侧一致
                marginHor = options.marginH || 50,
                //距离垂直边缘的距离，上下一致
                marginVer = options.marginV || 50,
                w = options.width - marginHor * 2,
                h = options.height - marginVer * 2,
                horGridVisible = options.horGridVisible || true,
                verGridVisible = options.verGridVisible || false,
                //用于最终绘制线段的数据源
                graphItems = {};

            //在这里解析数据
            //在这里计算出最大和最小值
            var dataAnalys = new dataAnalysis(sources, categoryField);
            categorySource = dataAnalys.getCategorySources();
            graphItems = dataAnalys.getGraphItems();
            max = dataAnalys.getMax();
            min = dataAnalys.getMin();


            //绘制Y轴
            var vAxis = new Axis({
                paper : paper,
                cx : cx + marginHor,
                cy : cy + marginVer,
                h : h,
                max : max,
                min : min,
                unit : unit
            });
            vAxis.draw();

            verPoints = vAxis.getPoints();
            total = vAxis.getTotal();
            max = vAxis.getMax();
            min = vAxis.getMin();
            //绘制水平线段
            if(horGridVisible == true)
            {
                for(i = 0; i < verPoints.length; i++)
                {
                    paper.path([M, cx + marginHor, verPoints[i], L, cx + w + marginHor, verPoints[i]]).attr(
                        {
                            stroke : "#666",
                            "stroke-width" : 1
                        });
                }
            }

            //绘制X轴
            var category = new CategoryAxis({
                paper : paper,
                cx : cx + marginHor,
                cy : cy + marginVer + h,
                w : w,
                sources : categorySource
            });
            category.draw();
            horPoints = category.getPoints();
            if(verGridVisible == true)
            {
                //绘制垂直线段
                for(i = 0; i < horPoints.length; i++)
                {
                    paper.path([M, horPoints[i], cy + marginVer, L, horPoints[i], cy + h + marginVer]).attr(
                        {
                            stroke : "#666",
                            "stroke-width" : 1
                        });
                }
            }


            //计算出像素与值之间的比例
            horInterval = w / total;
            verInterval = h / total;
            //创建graph
            var colorIndex = 0;
            for(k in graphItems)
            {
                var lineItem = graphItems[k];
                createGraph(lineItem, defaultColors[colorIndex]);
                ++colorIndex;
            }

            //创建线段
            function createGraph(val, color)
            {
                var vals = val.value,
                    label = val.label,
                    linePath = [],
                    //用于计算曲线的点集合
                    tempPoints = [];

                for(i = 0; i < vals.length; i++)
                {
                    if(i == 0)cmd = M;
                    else cmd = L;
                    var tempX = horPoints[i],
                        tempY = marginVer + (total - vals[i]) * verInterval;
                    tempPoints.push({ x: tempX, y: tempY });
                    linePath = linePath.concat([cmd, tempX, tempY]);
                    points.push(paper.circle(tempX, tempY, 5).attr({
                        fill : color,
                        title : label + " : " + vals[i]
                    }).data({
                            source : val,
                            value : vals[i],
                            label : label
                        })
                    );
                }
                //使用曲线
                if(graphType == "Curve")
                {
                    linePath = calcBezierLine(tempPoints);
                }

                lines.push(paper.path(linePath).attr({
                    stroke : color,
                    "stroke-width" : 2
                })
                    .data({
                        source : val
                    })
                    .prop({
                        color : color
                    }));
            }
            return this;
        }


        function calcBezierLine(ps)
        {
            var pPrev = {},pNext = {},
                pCurrent = {},pControl1 = {}, pControl2 = {}, lastPoint,
                pCenter = {},distance1 = 0, distance2 = 0,
                tempPoints = [], orgPath = [], bezierPath = [],
                r = options.curveDistance || 20, i = 0, slope = 0;
            //计算出所有需要线段经过的点
            for(i = 0; i < ps.length; i++)
            {
                //获取当前点
                pCurrent = ps[i];
                //第一个点和最后一个点直接放入
                if(i == 0 || i == ps.length - 1)
                {
                    tempPoints.push(pCurrent);
                    continue;
                }
                //获取上一个点和下一个点
                pPrev = ps[i - 1];
                pNext = ps[i + 1];
                //计算出pCurrent-pPrev与pCurrent-pNext中较短的一条线段作为基准
                distance1 = VC.Point.distance(pCurrent, pPrev);
                distance2 = VC.Point.distance(pCurrent, pNext);
                if(distance1 >= distance2)
                {
                    slope = VC.Point.slope(pPrev, pCurrent);
                    pCenter = { x: pCurrent.x + distance2 * Math.cos(slope), y: pCurrent.y + distance2 * Math.sin(slope) };
                    slope = VC.Point.slope(pNext, pCenter);
                }
                else
                {

                    slope = VC.Point.slope(pNext, pCurrent);
                    pCenter = { x: pCurrent.x + distance1 * Math.cos(slope), y: pCurrent.y + distance1 * Math.sin(slope) };
                    slope = VC.Point.slope(pPrev, pCenter);
                }
                //计算辅助点
                pControl1 = { x: pCurrent.x + r * Math.cos(slope), y: pCurrent.y + r * Math.sin(slope)};
                pControl2 = { x: pCurrent.x + r * Math.cos(slope + Math.PI), y: pCurrent.y + r * Math.sin(slope + Math.PI)};
                //在这里矫正位置
                if(VC.Point.distance(pControl1, pPrev) > VC.Point.distance(pControl1, pNext))
                {
                    var temp = pControl1;
                    pControl1 = pControl2;
                    pControl2 = temp;
                }
                if(lastPoint != undefined)
                {
                    pCenter = { x: (lastPoint.x + pControl1.x) / 2, y: (lastPoint.y + pControl1.y) / 2 };
                    tempPoints.push(pCenter);
                }
                tempPoints.push(pControl1);
                tempPoints.push(pCurrent);
                tempPoints.push(pControl2);
                lastPoint = pControl2;
            }

            //直连的情况
            if(tempPoints.length < 3)
            {
                bezierPath = ["M", tempPoints[0].x, tempPoints[0].y,
                    "L", tempPoints[1].x, tempPoints[1].y];
            }
            else
            {
                bezierPath = ["M", tempPoints[0].x, tempPoints[0].y];
                //在这里计算所有的辅助点，并绘制曲线
                for(i = 1; i < tempPoints.length - 1; i+=2)
                {
                    pPrev = tempPoints[i-1];
                    pCurrent = tempPoints[i];
                    pNext = tempPoints[i+1];
                    bezierPath = bezierPath.concat(["C", pPrev.x, pPrev.y, pCurrent.x, pCurrent.y, pNext.x, pNext.y]);
                }
            }
            return bezierPath;
        }

        return { draw : draw, updateOptions : updateOptions,
                 updateData : updateData, getItems : getItems }


    };

    /**
     * 柱状图组件
     * */
    VC.ColumnChart = function(dom, configs)
    {
        var paper = R(dom),
            items = paper.set(),
            options = updateOptions(configs),
            sources = updateData(configs.sources),
            points = {},
            columns = [];

        function updateOptions(configs)
        {
            options = options || {};
            for(var key in configs)
            {
                if(configs[key] != undefined)
                {
                    options[key] = configs[key];
                }
            }
            return options;
        }

        function updateData(val)
        {
            sources = val;
            return sources;
        }

        function getItems()
        {
            return columns;
        }

        function clear()
        {
            paper.clear();
            items = paper.set();
            columns = [];
            points = [];
        }

        function draw()
        {
            clear();
            var cx = options.cx || 0,
                cy = options.cy || 0,
                max = 0, min = 0, i = 0, k = 0,
                len = sources.length,
                unit = options.unit || "",
                graphType = options.graphType || "Default",
                categoryField = options.categoryField,
                categorySource = [],
                verInterval = 0, horInterval = 0,
                cmd = M, total = 0,
                verPoints = [], horPoints = [],
                //距离横向边缘的距离,左侧和右侧一致
                marginHor = options.marginH || 50,
                //距离垂直边缘的距离，上下一致
                marginVer = options.marginV || 50,
                w = options.width - marginHor * 2,
                h = options.height - marginVer * 2,
                horGridVisible = options.horGridVisible || true,
                verGridVisible = options.verGridVisible || false,
                //用于最终绘制柱状图的数据源
                graphItems = {}, itemCount = 0;

            //转换数据源
            var dataModel = new dataAnalysis(sources, categoryField, graphType);
            categorySource = dataModel.getCategorySources();
            max = dataModel.getMax();
            min = dataModel.getMin();
            graphItems = dataModel.getGraphItems();
            itemCount = dataModel.getItemCount();
            //创建X和Y轴
            var vAxis = new Axis({
                paper : paper,
                cx : cx + marginHor,
                cy : cy + marginVer,
                h : h,
                max : max,
                min : min,
                unit : unit
            });
            vAxis.draw();
            verPoints = vAxis.getPoints();
            total = vAxis.getTotal();
            max = vAxis.getMax();
            min = vAxis.getMin();
            if(horGridVisible == true)
            {
                //绘制水平线段
                for(i = 0; i < verPoints.length; i++)
                {
                    paper.path([M, cx + marginHor, verPoints[i], L, cx + w + marginHor, verPoints[i]]).attr(
                        {
                            stroke : "#666",
                            "stroke-width" : 1
                        });
                }
            }

            //绘制X轴
            var category = new CategoryAxis({
                paper : paper,
                cx : cx + marginHor,
                cy : cy + marginVer + h,
                w : w,
                sources : categorySource
            });
            category.draw();
            horPoints = category.getPoints();
            if(verGridVisible == true)
            {
                //绘制垂直线段
                for(i = 0; i < horPoints.length; i++)
                {
                    paper.path([M, horPoints[i], cy + marginVer, L, horPoints[i], cy + h + marginVer]).attr(
                        {
                            stroke : "#666",
                            "stroke-width" : 1
                        });
                }
            }

            //计算出像素与值之间的比例
            horInterval = w / total;
            verInterval = h / total;
            //创建graph
            var index = 0;
            var yPosSet = {};
            for(k in graphItems)
            {
                var lineItem = graphItems[k];
                yPosSet[index] = [];
                createGraph(lineItem, index);
                ++index;
            }

            function createGraph(item, index)
            {
                var vals = item.value,
                    label = item.label,
                    maxWidth = w * 0.5 / (categorySource.length - 1),
                    graphType = options.graphType || "Default",
                    columnWidth = graphType == "Default" ? maxWidth / itemCount : maxWidth,
                    start = 0, tempX = 0, tempY = 0, val = 0, column, lastYPos = 0;
                if(graphType == "Default")
                {
                    for(i = 0; i < vals.length; i++)
                    {
                        val = vals[i];
                        tempX = horPoints[i] - maxWidth / 2 + index * columnWidth;
                        tempY = marginVer + verInterval * (total - val);
                        column = paper.rect(tempX, tempY, columnWidth, h + marginVer - tempY).attr({
                            fill : defaultColors[index],
                            stroke : "#fff",
                            "stroke-width" : 2
                        }).data({
                            source : item,
                            value : val,
                            label : label
                        });
                        items.push(column);
                    }
                }
                else
                {
                    for(i = 0; i < vals.length; i++)
                    {
                        if(k == categoryField)continue;
                        val = vals[i];
                        if(index == 0)lastYPos = 0;
                        else lastYPos = yPosSet[index - 1][i];
                        tempX = horPoints[i] - columnWidth / 2;
                        var currentTempY = marginVer + verInterval * (total - val);
                        tempY = currentTempY - lastYPos;
                        column = paper.rect(tempX, tempY, columnWidth, h + marginVer - currentTempY).attr({
                            fill : defaultColors[index],
                            stroke : "#fff",
                            "stroke-width" : 2
                        }).data({
                            source : item,
                            value : val,
                            label : label
                        });
                        items.push(column);
                        yPosSet[index][i] = h + marginVer - tempY;
                    }
                }
                i = 0;
            }
        }

        return { draw : draw, updateOptions : updateOptions,
            updateData : updateData, getItems : getItems }
    };

    /**
     * 水平柱状图
     * */
    VC.BarChart = function(dom, configs)
    {
        var paper = R(dom),
            items = paper.set(),
            options = updateOptions(configs),
            sources = updateData(configs.sources),
            points = {},
            columns = [];

        function updateOptions(configs)
        {
            options = options || {};
            for(var key in configs)
            {
                if(configs[key] != undefined)
                {
                    options[key] = configs[key];
                }
            }
            return options;
        }

        function updateData(val)
        {
            sources = val;
            return sources;
        }

        function getItems()
        {
            return columns;
        }

        function clear()
        {
            paper.clear();
            items = paper.set();
            columns = [];
            points = [];
        }

        function draw()
        {
            clear();
            var cx = options.cx || 0,
                cy = options.cy || 0,
                max = 0, min = 0, i = 0, k = 0,
                len = sources.length,
                unit = options.unit || "",
                graphType = options.graphType || "Default",
                categoryField = options.categoryField,
                categorySource = [],
                verInterval = 0, horInterval = 0,
                cmd = M, total = 0,
                verPoints = [], horPoints = [],
                //距离横向边缘的距离,左侧和右侧一致
                marginHor = options.marginH || 50,
                //距离垂直边缘的距离，上下一致
                marginVer = options.marginV || 50,
                w = options.width - marginHor * 2,
                h = options.height - marginVer * 2,
                horGridVisible = options.horGridVisible || true,
                verGridVisible = options.verGridVisible || false,
                //用于最终绘制柱状图的数据源
                graphItems = {}, itemCount = 0;

            //转换数据源
            var dataModel = new dataAnalysis(sources, categoryField, graphType);
            categorySource = dataModel.getCategorySources();
            max = dataModel.getMax();
            min = dataModel.getMin();
            graphItems = dataModel.getGraphItems();
            itemCount = dataModel.getItemCount();
            //创建X和Y轴
            var vAxis = new Axis({
                paper : paper,
                direction : "Hor",
                cx : cx + marginHor,
                cy : cy + marginVer + h,
                w : w,
                h : h,
                interval : 100,
                max : max,
                min : min,
                unit : unit
            });
            vAxis.draw();
            horPoints = vAxis.getPoints();
            total = vAxis.getTotal();
            max = vAxis.getMax();
            min = vAxis.getMin();
            if(verGridVisible == true)
            {
                //绘制垂直线段
                for(i = 0; i < horPoints.length; i++)
                {
                    paper.path([M, horPoints[i], cy + marginVer, L, horPoints[i], cy + h + marginVer]).attr(
                        {
                            stroke : "#666",
                            "stroke-width" : 1
                        });
                }
            }

            //绘制X轴
            var category = new CategoryAxis({
                paper : paper,
                direction : "Ver",
                cx : cx + marginHor,
                cy : cy + marginVer,
                w : w,
                h : h,
                sources : categorySource
            });
            category.draw();
            verPoints = category.getPoints();
            if(horGridVisible == true)
            {
                //绘制水平线段
                for(i = 0; i < verPoints.length; i++)
                {
                    paper.path([M, cx + marginHor, verPoints[i], L, cx + w + marginHor, verPoints[i]]).attr(
                        {
                            stroke : "#666",
                            "stroke-width" : 1
                        });
                }
            }

            //计算出像素与值之间的比例
            horInterval = w / total;
            verInterval = h / total;
            //创建graph
            var index = 0;
            var xPosSet = {};
            for(k in graphItems)
            {
                var lineItem = graphItems[k];
                xPosSet[index] = [];
                createGraph(lineItem, index);
                ++index;
            }

            function createGraph(item, index)
            {
                var vals = item.value,
                    label = item.label,
                    maxWidth = h * 0.5 / (categorySource.length - 1),
                    graphType = options.graphType || "Default",
                    columnWidth = graphType == "Default" ? maxWidth / itemCount : maxWidth,
                    start = 0, tempX = 0, tempY = 0, val = 0, column, lastXPos = 0;
                if(graphType == "Default")
                {
                    for(i = 0; i < vals.length; i++)
                    {
                        val = vals[i];
                        tempX = horInterval * val;
                        tempY = verPoints[i] - maxWidth / 2 + index * columnWidth;
                        column = paper.rect(marginHor, tempY, tempX, columnWidth).attr({
                            fill : defaultColors[index],
                            stroke : "#fff",
                            "stroke-width" : 2
                        });
                        items.push(column);
                    }
                }
                else
                {
                    for(i = 0; i < vals.length; i++)
                    {
                        if(k == categoryField)continue;
                        val = vals[i];
                        if(index == 0)lastXPos = 0;
                        else lastXPos = xPosSet[index - 1][i];
                        tempX = horInterval * val;
                        tempY = verPoints[i] - maxWidth / 2;
                        column = paper.rect(lastXPos + marginHor, tempY, tempX, columnWidth).attr({
                            fill : defaultColors[index],
                            stroke : "#fff",
                            "stroke-width" : 2
                        });
                        items.push(column);
                        xPosSet[index][i] = lastXPos + tempX;
                    }
                }
                i = 0;
            }
        }

        return { draw : draw, updateOptions : updateOptions,
            updateData : updateData, getItems : getItems }
    };

    glob.VChart = VC;
    return VC;
}(this, Raphael));
