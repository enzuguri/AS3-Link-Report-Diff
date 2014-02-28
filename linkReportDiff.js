/*
 * DiffObject constructor which takes two numeric values to compare.
 */
function DiffObject(leftVal, rightVal){
  this.leftVal = leftVal;
  this.rightVal = rightVal;
}

/*
 * Performs a diff between the two numeric values, left - right.
 */
DiffObject.prototype.diff = function(){
  return this.leftVal - this.rightVal;
}


function ScriptDescriptor(){

}

ScriptDescriptor.prototype = {
	get size(){
		return this.size;	
	},
	get optSize(){
		return this.optSize;
	},
	get name(){
		return this.name;
	}
}

function ScriptDiff(leftScript, rightScript){
	this.name = leftScript.name || rightScript.name;
	this.size = new DiffObject(leftScript.size, rightScript.size);
	this.optSize = new DiffObject(leftScript.optSize, rightScript.optSize);
}

function LinkReport(){

}

LinkReport.prototype = {

	/*diffWith(linKReport){

	}*/
}

var LinkReportDiff = {

	createDiffItem: function(newValue, oldValue){
		return {
			name: newValue.name || oldValue.name,
			size: {
				"new": newValue.size,
				"old": oldValue.size,
				"diff": newValue.size - oldValue.size
			},
			optSize: {
				"new": newValue.optSize,
				"old": oldValue.optSize,
				"diff": newValue.optSize - oldValue.optSize
			}
		}
	},

	compareDescriptors:function(a, b){
		if(b == null){
			b = {};
		}
		
		var same = [], bigger = [], smaller = [], added = [], removed = [];
		var newValue = null, oldValue = null, diffItem = null, diff = 0;

		for(var key in a){
			newValue = a[key];
			oldValue = b[key];
			if(oldValue != null){
				diffItem = this.createDiffItem(newValue, oldValue);
				diff = diffItem.size.diff;
				if(Math.abs(diff) > 0){
					if(diff > 0){
						bigger.push(diffItem);
					}else{
						smaller.push(diffItem);
					}
				}else{
					same.push(diffItem);
				}
				delete b[key];
			}else{
				diffItem = this.createDiffItem(newValue, {optSize:0, size:0, name:false});
				added.push(diffItem);
			}
		}

		//process remaining items
		for(var key in b){
			oldValue = b[key];
			removed.push(this.createDiffItem({name:false, optSize:0, size:0}, oldValue));
		}

		added.sort(function(a,b){return b.size.diff-a.size.diff});
		bigger.sort(function(a,b){return b.size.diff-a.size.diff});

		smaller.sort(function(a,b){return a.size.diff-b.size.diff});
		removed.sort(function(a,b){return a.size.diff-b.size.diff});

		var report = {
				same:this.calculateTotals(same),
				added:this.calculateTotals(added),
				removed:this.calculateTotals(removed),
				bigger:this.calculateTotals(bigger),
				smaller:this.calculateTotals(smaller)
			};

		var culmulative = this.calculateTotals([report.same, report.added, report.removed, report.bigger, report.smaller]);

		report.size = culmulative.size;
		report.optSize = culmulative.optSize;
		report.count = same.length + added.length + bigger.length + smaller.length;

		return report;
	},

	calculateTotals:function(items){
		var oldSize = 0, newSize = 0, diff = 0, item = null, oldOptSize = 0, newOptSize = 0, optDiff = 0;

		for(var i = 0, l = items.length; i<l; i++){
			item = items[i];
			oldSize += item.size.old;
			newSize += item.size.new;
			diff += item.size.diff;

			oldOptSize += item.optSize.old;
			newOptSize += item.optSize.new;
			optDiff += item.optSize.diff;
		}

		return {
			items:items,
				size:{
					"new":newSize,
					"old":oldSize,
					"diff":diff
				},
				optSize:{
					"new":newOptSize,
					"old":oldOptSize,
					"diff":optDiff
				},
				count: items.length
			}
	},

	makeDescriptor:function(scriptNode){
		var size = scriptNode.getAttribute("size");
		var mod = scriptNode.getAttribute("mod");
		var optSize = scriptNode.getAttribute("optimizedsize");
		var scriptFile = scriptNode.getAttribute("name");

		var defNode = scriptNode.querySelector("def");

		var className = defNode.id;

		return {name:className, size:parseInt(size), mod:parseInt(mod), optSize:parseInt(optSize), scriptFile:scriptFile};
	},

	getScriptDescriptors:function(xmlDoc){
		var scripts = xmlDoc.querySelectorAll("script");
		var scriptMap = {};

		for(var i = 0, l = scripts.length; i<l; i++){
			var descriptor = this.makeDescriptor(scripts[i]);
			scriptMap[descriptor.name] = descriptor;
		}

		return scriptMap;
	}
}