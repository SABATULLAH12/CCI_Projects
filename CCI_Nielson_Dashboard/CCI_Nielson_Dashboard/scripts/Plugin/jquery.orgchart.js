(function ($) {
    let eachrow = 0;
    $.fn.orgChart = function(options) {
        var opts = $.extend({}, $.fn.orgChart.defaults, options);
        return new OrgChart($(this), opts);        
    }

    $.fn.orgChart.defaults = {
        data: [{id:1, name:'Root', parent: 0}],
        showControls: false,
        allowEdit: false,
        onAddNode: null,
        onDeleteNode: null,
        onClickNode: null,
        newNodeText: 'Add Child'
    };

    function OrgChart($container, opts) {
        eachrow = 0;
        var data = opts.data;
        var nodes = {};
        var rootNodes = [];
        this.opts = opts;
        this.$container = $container;
        var self = this;
        self.Measure = returnMeasure(opts);

        this.draw = function(){
            $container.empty().append(rootNodes[0].render(opts));
            $container.find('.node').click(function(){
                if(self.opts.onClickNode !== null){
                    self.opts.onClickNode(nodes[$(this).attr('node-id')]);
                }
            });

            if(opts.allowEdit){
                $container.find('.node h2').click(function(e){
                    var thisId = $(this).parent().attr('node-id');
                    self.startEdit(thisId);
                    e.stopPropagation();
                });
            }

            // add "add button" listener
            $container.find('.org-add-button').click(function(e){
                var thisId = $(this).parent().attr('node-id');

                if(self.opts.onAddNode !== null){
                    self.opts.onAddNode(nodes[thisId]);
                }
                else{
                    self.newNode(thisId);
                }
                e.stopPropagation();
            });

            $container.find('.org-del-button').click(function(e){
                var thisId = $(this).parent().attr('node-id');

                if(self.opts.onDeleteNode !== null){
                    self.opts.onDeleteNode(nodes[thisId]);
                }
                else{
                    self.deleteNode(thisId);
                }
                e.stopPropagation();
            });
        }

        this.startEdit = function(id){
            var inputElement = $('<input class="org-input" type="text" value="'+nodes[id].data.name+'"/>');
            $container.find('div[node-id='+id+'] h2').replaceWith(inputElement);
            var commitChange = function(){
                var h2Element = $('<h2>'+nodes[id].data.name+'</h2>');
                if(opts.allowEdit){
                    h2Element.click(function(){
                        self.startEdit(id);
                    })
                }
                inputElement.replaceWith(h2Element);
            }  
            inputElement.focus();
            inputElement.keyup(function(event){
                if(event.which == 13){
                    commitChange();
                }
                else{
                    nodes[id].data.name = inputElement.val();
                }
            });
            inputElement.blur(function(event){
                commitChange();
            })
        }

        this.newNode = function(parentId){
            var nextId = Object.keys(nodes).length;
            while(nextId in nodes){
                nextId++;
            }

            self.addNode({id: nextId, name: '', parent: parentId});
        }

        this.addNode = function(data){
            var newNode = new Node(data);
            nodes[data.id] = newNode;
            nodes[data.parent].addChild(newNode);

            self.draw();
            self.startEdit(data.id);
        }

        this.deleteNode = function(id){
            for(var i=0;i<nodes[id].children.length;i++){
                self.deleteNode(nodes[id].children[i].data.id);
            }
            nodes[nodes[id].data.parent].removeChild(id);
            delete nodes[id];
            self.draw();
        }

        this.getData = function(){
            var outData = [];
            for(var i in nodes){
                outData.push(nodes[i].data);
            }
            return outData;
        }

        // constructor
        for(var i in data){
            var node = new Node(data[i]);
            nodes[data[i].id] = node;
        }

        // generate parent child tree
        for(var i in nodes){
            if(nodes[i].data.parent == 0){
                rootNodes.push(nodes[i]);
            }
            else{
                nodes[nodes[i].data.parent].addChild(nodes[i]);
            }
        }

        // draw org chart
        $container.addClass('orgChart');
        self.draw();
    }

    function Node(data){
        this.data = data;
        this.children = [];
        var self = this;

        this.addChild = function(childNode){
            this.children.push(childNode);
        }

        this.removeChild = function(id){
            for(var i=0;i<self.children.length;i++){
                if(self.children[i].data.id == id){
                    self.children.splice(i,1);
                    return;
                }
            }
        }

        this.render = function(opts){
            var childLength = self.children.length,
                mainTable;

            mainTable = "<table id='nodetbl' cellpadding='0' cellspacing='0' border='0'>";
            var nodeColspan = childLength > 0 ? 2 * childLength : 2;
            let showornot = "";
            if (eachrow == 0)
                showornot = "display:none";
            mainTable += "<tr style ='" + showornot + ";height:11vh;'><td colspan='" + nodeColspan + "'>" + self.formatNode(opts) + "</td></tr>";
           
            eachrow++;
            if(childLength > 0){
                var downLineTable = "<table cellpadding='0' cellspacing='0' border='0'><tr style=" + showornot + " class='lines x'><td class='line left half'></td><td class='line right half'></td></table>";
                mainTable += "<tr class='lines'><td colspan='"+childLength*2+"'>"+downLineTable+'</td></tr>';

                var linesCols = '';
                for(var i=0;i<childLength;i++){
                    if(childLength==1){
                        linesCols += "<td class='line left half'></td>";    // keep vertical lines aligned if there's only 1 child
                    }
                    else if(i==0){
                        linesCols += "<td class='line left'></td>";     // the first cell doesn't have a line in the top
                    }
                    else{
                        linesCols += "<td class='line left top'></td>";
                    }

                    if(childLength==1){
                        linesCols += "<td class='line right half'></td>";
                    }
                    else if(i==childLength-1){
                        linesCols += "<td class='line right'></td>";
                    }
                    else{
                        linesCols += "<td class='line right top'></td>";
                    }
                }
                mainTable += "<tr class='lines v'>"+linesCols+"</tr>";

                mainTable += "<tr>";
                for(var i in self.children){
                    mainTable += "<td colspan='2'>"+self.children[i].render(opts)+"</td>";
                }
                mainTable += "</tr>";
            }
            mainTable += '</table>';           
            return mainTable;
        }
        
        this.formatNode = function (opts) {
            var nameString = '',
                descString = '';
            self.data.presign = (opts.data.Measure.toLowerCase() == "volume growth" || opts.data.Measure.toLowerCase() == "value growth") ? "%" : "pp";
            if (typeof data.name !== 'undefined') {
                //nameString = "<div class='childNdBdy'><div class='menuIcon {{childnodIco}} '></div><div class='topName top-right-nodeName-txt ' title='" + self.data.name + "' >" + self.data.name + "</div><div style='box-shadow: none;' class='bottomName top-right-nodeName-txt t-r-nN-prnt-txt " + checkVolume((opts.data.Measure != "growth" && opts.data.Measure != "transactiongrowth") ? self.data.tooltip : self.data.selected, opts.data.Measure) + "' title='" + commaOrperc(self.data.tooltip, opts.data.Measure, true) + "'>" + commaOrperc(self.data.selected, opts.data.Measure) + self.data.presign + "</div><div class='mnuPlcHldr'></div><div class='clickMenu' ng-click='TRDropdown($event,this)' node-id='" + this.data.id + "' ></div></div>";
                nameString = "<div class='childNdBdy'><div class='topName top-right-nodeName-txt ' title='" + self.data.name + "' ><div class='leafval_trpdot'>" + self.data.name + "</div></div><div style='box-shadow: none;' class='bottomName top-right-nodeName-txt t-r-nN-prnt-txt " + checkVolume(self.data.Dvalue, opts.data.Measure) + "' title='" + fixSignsTooltip(self.data.tooltip, opts.data.Measure) + "'>" + commaOrperc(self.data.Dvalue, opts.data.Measure) + self.data.presign + "</div></div><div class='npop'><div class='npoparrow' ng-click='showOrgPopup($event);$event.stopPropagation();'></div></div>";
            }
            if (typeof data.description !== 'undefined') {
                descString = '<p>' + self.data.description + '</p>';
            }           
            return "<div class='node'  node-id='" + this.data.id + "' legacy='" + self.data.org_name + "' org-name='" + self.data.name + "' isMTQry='" + ((self.data.isMTQry == null || self.data.isMTQry == undefined) ? false : self.data.isMTQry) + "'>" + nameString + "</div>";
        }
    }

})(jQuery);
function commaOrperc(val,measure)
{
    if (val != null && val != undefined) {
        let grval = val;
        if (measure != null && measure.toLowerCase().indexOf("growth") > 0)
            grval = val * 100;
        if (parseFloat(grval).toLocaleString('en-US', { maximumFractionDigits: 1 }) == 0)
            return 0;
        else {
            //if (measure!=null && measure.toLowerCase().indexOf("growth")>0)
            //    return parseFloat(val*100).toLocaleString('en-US', { maximumFractionDigits: 1 });
            //else
            return parseFloat(grval).toLocaleString('en-US', { maximumFractionDigits: 1 });
        }
    }
   return val;
}
function fixSignsTooltip(value,measure)
{
    if (value == null && value == undefined) {
        return "NA";
    }
    if (measure.toLowerCase() == "volume growth") {
        //if (value != null && value != undefined) {
            if (parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 1 }) == 0)
                return "Absolute Volume:" + "0" + "(000 UCs)";
            else
                return "Absolute Volume:" + parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 1 }) + "(000 UCs)";
       // }
       // return "Absolute Volume:" + value +"(000 UCs)";
    } else if (measure.toLowerCase() == "value growth") {
       // if (value != null && value != undefined) {
            if (parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 1 }) == 0)
                return "Absolute Value:" + "0" + "(000)";
            else
                return "Absolute Value:" + parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 1 }) + "(000)";
       // }
       // return "Absolute Value:" + value + "(000)";
    } else {
        return "Share:" + parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 1 }) + "%";
    }
}
function divby1000forVol(val, Measure,tooltip)
{
  if (Measure != null && Measure != undefined && (Measure == "volume" || Measure == "transactionvolume")) {
        return val / 1000;
    }
    return val;

}
function addGrowth(val, Measure, tooltip)
{
    if (val == null || val == undefined || val == "NA")
        return "NA";
    if (Measure != "growth" && Measure != "transactiongrowth")
        return "Growth : " + parseFloat(val).toLocaleString('en-US', { maximumFractionDigits: 1 }) + "%"; //
    else
        return "Volume : " + parseFloat(val / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function checkVolume(val, measure) {
    //if (Measure != null && Measure != undefined && (Measure == "growth" || Measure == "transactiongrowth"))
    {
        if (measure != null && measure.toLowerCase().indexOf("growth") > 0)
            val = val * 100;
        if (val != null && val != undefined)
            val = parseFloat(val).toLocaleString('en-US', { maximumFractionDigits: 1 });
        if(val < 0)
            return 'redTxt';
        else if (val != null && val != undefined && val > 0)
            return 'greenTxt';
    }
    return '';

}

function returnMeasure(opts)
{
    try{
        if (opts != null && opts != undefined && opts.data != null && opts.data != undefined && opts.data.Measure != null && opts.data.Measure != undefined)
            return opts.data.Measure;
    } catch (ex) {
        console.log(ex.message);        
    }
    return false;
}