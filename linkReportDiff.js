var LinkReportDiff = {
	
	diffTextSources:function(newText, oldText){

		var newDescriptors = this.getScriptDescriptors(this.convertTextToXML(newText));
		var oldDescriptors = this.getScriptDescriptors(this.convertTextToXML(oldText));

		return this.compareDescriptors(newDescriptors, oldDescriptors);
	},
	
	
	compareDescriptors:function(a, b){
		
		var same = [], bigger = [], smaller = [], added = [], removed = [];
		
		var newValue = null, oldValue = null, diff = null;
		for(var key in a){
			newValue = a[key];
			oldValue = b[key];
			diffItem = {name:newValue.name, newSize:newValue.optSize}
			if(oldValue != null){
				var diff = newValue.optSize - oldValue.optSize;
				diffItem.diff = diff;
				diffItem.oldSize = oldValue.optSize;
				if(Math.abs(diff) > 0){
					if(diff > 0){
						bigger.push(diffItem);
					}else{
						smaller.push(diffItem);
					}
				}else{
					diffItem.diff = 0;
					same.push(diffItem);
				}
				delete b[key];
			}else{
				diffItem.diff = diffItem.newSize;
				diffItem.oldSize = 0;
				added.push(diffItem);
			}
		}
		
		//process remaining items
		for(var key in b){
			oldValue = b[key];
			removed.push({name:oldValue.name, newSize:0, oldSize:oldValue.optSize, diff:0-oldValue.optSize});
		}	
		
		var report = {
				same:this.calculateTotals(same), 
				added:this.calculateTotals(added), 
				removed:this.calculateTotals(removed), 
				bigger:this.calculateTotals(bigger), 
				smaller:this.calculateTotals(smaller)
			};

		var culmulative = this.calculateTotals([report.same, report.added, report.removed, report.bigger, report.smaller]);

		report.totalNewSize = culmulative.newSize;
		report.totalOldSize = culmulative.oldSize;
		report.totalDiff = culmulative.diff;

		return report;
	},

	calculateTotals:function(items){
		var oldSize = 0, newSize = 0, diff = 0, item = null;

		for(var i = 0, l = items.length; i<l; i++){
			item = items[i];
			oldSize += item.oldSize;
			newSize += item.newSize;
			diff += item.diff;
		}

		return {items:items, newSize:newSize, oldSize:oldSize, diff:diff};
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
	},

	convertTextToXML:function(text){
		if (window.DOMParser)
	  	{
	  		parser=new DOMParser();
	  		xmlDoc=parser.parseFromString(text,"text/xml");
	  	}
		else // Internet Explorer
	  	{
	  		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	  		xmlDoc.async=false;
	  		xmlDoc.loadXML(text); 
	  	}
	  	return xmlDoc;
	}

}