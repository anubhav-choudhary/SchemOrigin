var SchemaGenerator = function() {
	//Properties
	var that = this;
	//Constructors
	var CreateAttributeList = function() {
		var list = [];
		this.addA = function(attr) {
			list[list.length] = {
				a_name: attr.a_name,
				a_type: attr.a_type
			};
		}
		this.data = list;
		this.addM = function(attr) {
			var att_array = attr.split(",");
			for (var i = 0; i < att_array.length; i++) {
				if (att_array[i] == "") {
					continue;
				} else if (att_array[i].lastIndexOf("_pk") != -1) {
					list[list.length] = {
						a_name: att_array[i].substring(0, att_array[i].lastIndexOf("_pk")).toLowerCase(),
						a_type: "pk"
					};
				} else if (att_array[i].lastIndexOf("_mv") != -1) {
					list[list.length] = {
						a_name: att_array[i].substring(0, att_array[i].lastIndexOf("_mv")).toLowerCase(),
						a_type: "mv"
					};
				} else {
					list[list.length] = {
						a_name: att_array[i].toLowerCase(),
						a_type: ""
					};
				}
			}
		}
		this.search = function(name) {
			var flag = false;
			for (var i = 0; i < list.length; i++) {
				if (list[i].name == attr) {
					return list[i];
				}
			}
			return -1;
		}
		this.delAtt = function(name) {
			var len = list.length;
			for (var i = 0; i < len; i++) {
				if (list[i].a_name == name) {
					list.splice(i, 1);
					i--;
					len--;
				}
			}
		}
		this.getAttributes = function() {
			return list;
		}
		this.getPK = function() {
			var pk_list = [];
			for (var i = 0; i < list.length; i++) {
				if (list[i].a_type == "pk") {
					pk_list[pk_list.length] = list[i];
				}
			}
			return pk_list;
		}
		this.getMV = function() {
			var pk_list = [];
			for (var i = 0; i < list.length; i++) {
				if (list[i].type == "mv") {
					pk_list[pk_list.length] = list[i];
				}
			}
			return pk_list;
		}
	}
	//Methods
	var addEntity = function(name, attributeList) {
		that[name.toUpperCase()] = attributeList;
	}
	var isExist = function(name) {
		return (that[name] !== undefined);
	}
	var shiftPK = function(para1, para2) {
		if (that[para2] === undefined) console.log("||" + para2 + " not found");
		var pk_list = that[para2].getPK();
		for (var i = 0; i < pk_list.length; i++) {
			var type = "fk#" + para2 + ":" + pk_list[i].a_name;
			that[para1].addA({
				a_name: pk_list[i].a_name,
				a_type: type
			})
		}
	}
	var parseEntity = function(data) {
		var endIndex = data.indexOf("%%");
		var entityName;
		var attributes;
		var currPos = 0;
		var endPos;
		var startPos;
		var attEnd;
		while (currPos < endIndex) {
			startPos = data.indexOf("#", currPos);
			if (startPos > endIndex) break;
			endPos = data.indexOf(":", startPos);
			entityName = data.substring(startPos + 1, endPos);
			attEnd = data.indexOf(";", endPos);
			attributes = data.substring(endPos + 1, attEnd);
			var Alist = new CreateAttributeList();
			Alist.addM(attributes);
			addEntity(entityName, Alist);
			applyMV(entityName);
			currPos = attEnd + 1;
		}
	}
	var applyMV = function(entityname) {
		var entity = that[entityname.toUpperCase()];
		var list = entity.getAttributes();
		for (var i = 0; i < list.length; i++) {
			if (list[i].a_type == "mv") {
				var att_list = new CreateAttributeList();
				var newEntity = entityname + "_" + list[i].a_name;
				var pklist = entity.getPK();
				for (var j = 0; j < pklist.length; j++) {
					att_list.addA({
						a_name: pklist[j].a_name,
						a_type: "pk"
					});
				}
				att_list.addA({
					a_name: list[i].a_name,
					a_type: ""
				});
				addEntity(newEntity, att_list);
			}
		}
		for (var i = 0; i < list.length; i++) {
			if (list[i].a_type == "mv") {
				list.splice(i, 1);
				i--;
			}
		}
	}
	var parseRelation = function(data) {
		var startPos = data.indexOf("%%");
		var endPos = data.length - 1;
		var currPos = startPos;
		var relEnd;
		while (currPos < endPos) {
			currPos = data.indexOf("@", currPos);
			if (currPos == -1) break;
			relEnd = data.indexOf(";", currPos);
			processRelation(data.substring(currPos, relEnd));
			currPos = relEnd;
		}
	}
	var processRelation = function(relation) {
		var rel = relation.toUpperCase();
		var relname;
		if (rel.indexOf(":1:1:") != -1) relname = ":1:1:";
		else if (rel.indexOf(":1:M:") != -1) relname = ":1:M:";
		else if (rel.indexOf(":M:1:") != -1) relname = ":M:1:";
		else if (rel.indexOf(":M:M:") != -1) relname = ":M:M:";
		else if (rel.indexOf(":ISA:") != -1) relname = ":ISA:";
		var para1 = rel.substring(2, rel.indexOf(relname));
		var para2 = rel.substring(rel.indexOf(relname) + 6, rel.length);
		if (relname == ":1:1:") applyOneOne(para1, para2);
		else if (relname == ":1:M:") applyOneMany(para1, para2);
		else if (relname == ":M:1:") applyManyOne(para1, para2);
		else if (relname == ":M:M:") applyManyMany(para1, para2);
		else if (relname == ":ISA:") applyISA(para1, para2);
	}
	var applyOneOne = function(para1, para2) {
		shiftPK(para1, para2);
	}
	var applyOneMany = function(para1, para2) {
		shiftPK(para2, para1);
	}
	var applyManyOne = function(para1, para2) {
		shiftPK(para1, para2);
	}
	var applyManyMany = function(para1, para2) {
		var list1 = that[para1].getPK();
		var list2 = that[para2].getPK();
		var entity_name = para1 + "_" + para2;
		var finallist = new CreateAttributeList();
		for (var i = 0; i < list1.length; i++) {
			finallist.addA({
				a_name: list1[i].a_name,
				a_type: "pk"
			});
		}
		for (var i = 0; i < list2.length; i++) {
			finallist.addA({
				a_name: list2[i].a_name,
				a_type: "pk"
			});
		}
		addEntity(entity_name, finallist);
	}
	var applyISA = function(para1, para2) {
		var complete_att = [];
		var childs = para2.split(":");
		childs[0] = "#" + childs[0];
		for (var i = 0; i < childs.length; i++) {
			complete_att = complete_att.concat(that[childs[i].substr(1)].getAttributes());
		}
		complete_att.sort(function(a, b) {
			return (a.a_name > b.a_name);
		});
		var count = 1;
		var comm_att = [];
		for (var i = 1; i < complete_att.length; i++) {
			if (complete_att[i].a_name == complete_att[i - 1].a_name) count++;
			else count = 1;
			if (count == childs.length) comm_att[comm_att.length] = complete_att[i];
		}
		for (var i = 0; i < comm_att.length; i++) {
			that[para1].addA({
				a_name: comm_att[i].a_name,
				a_type: comm_att[i].a_type
			});
		}
		for (var i = 0; i < comm_att.length; i++) {
			if (comm_att[i].a_type == "pk") continue;
			for (var j = 0; j < childs.length; j++) {
				that[childs[j].substr(1)].delAtt(comm_att[i].a_name);
			}
		}
	}
	this.runScript = function(data) {
		parseEntity(data);
		parseRelation(data);
		console.log(this);
	}
}

	function gencode() {
		var gen = new SchemaGenerator();
		var str = "#Faculty:EmailId_pk,name,address;#Student:EmailId_pk,name,address,phoneno_mv;#Department:departmentId_pk,name;#SubCategory:SubCatId_pk,name;#Post:postid_pk,content,datetime;#Writer:;%%@#Faculty:M:1:#Department;@#Department:1:1:#SubCategory;@#Faculty:M:M:#SubCategory;@#SubCategory:1:M:#Post;@#Writer:ISA:#Student:#Faculty;"
		var script = document.getElementById('script');
		gen.runScript(script.value);
	}
