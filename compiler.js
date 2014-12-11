var Compiler = function(input, error_div) {
	//==============Shared Components================
	var showError = function(msg) {
		error_div.innerHTML = msg;
	}

	var getInput = function() {
		return input.value.trim();
	}
	//==============LEX Components===============IP:getInput(); OP: result;====

	var lexeme = "";
	var currLineNo = 1;
	var currState = 1;
	var result = "";
	var error = "";

	var transTable = [{
		A: 2,
		B: 4,
		C: 6,
		D: 11,
		E: 13,
		F: 14,
		G: 3,
		H: 9,
		I: 5,
		J: 15,
		O: 15
	}, //1
	{}, //2 <Comma Identified> return 1;
	{}, //3 <Colon Identified> return 1;
	{}, //4 <Semicolon Identified> return 1;
	{}, //5 <Number Identified> return 1;
	{
		H: 7,
		A: 16,
		B: 16,
		C: 16,
		D: 16,
		E: 16,
		F: 16,
		G: 16,
		I: 16,
		J: 16,
		O: 16
	}, //6
	{
		H: 7,
		I: 7,
		J: 7,
		A: 8,
		B: 8,
		C: 8,
		D: 8,
		E: 8,
		F: 8,
		G: 8,
		O: 8
	}, //7
	{}, //8 <TableName identified> return 1;
	{
		H: 9,
		I: 9,
		J: 9,
		A: 10,
		B: 10,
		C: 10,
		D: 10,
		E: 10,
		F: 10,
		G: 10,
		O: 10
	}, //9
	{}, //10 <String identified> return 1;
	{
		D: 12,
		A: 17,
		B: 17,
		C: 17,
		E: 17,
		F: 17,
		G: 17,
		H: 17,
		I: 17,
		J: 17,
		O: 17
	}, //11
	{}, //12 <Section Separator Identified> return 1;
	{}, //13 <Relation Identified> return 1;
	{}, //14 <new Line Identified> return 1;
	//Error States
	{}, //15 Error in lineNo#; Stop
	{}, //16 Invalid Table name in lineNo# Stop
	{}, //17 Invalid token in lineNo#  Stop
	];

	var nextState = function(state, ch) {
		if (ch == ",") return transTable[state - 1]["A"];
		else if (ch == ";") return transTable[state - 1]["B"];
		else if (ch == "#") return transTable[state - 1]["C"];
		else if (ch == "%") return transTable[state - 1]["D"];
		else if (ch == "@") return transTable[state - 1]["E"];
		else if (ch == "\n") return transTable[state - 1]["F"];
		else if (ch == ":") return transTable[state - 1]["G"];
		else if ((ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) <= 90) || (ch.charCodeAt(0) >= 97 && ch.charCodeAt(0) <= 122)) return transTable[state - 1]["H"];
		else if (ch.charCodeAt(0) >= 48 && ch.charCodeAt(0) <= 57) return transTable[state - 1]["I"];
		else if (ch == "_") return transTable[state - 1]["J"];
		else return transTable[state - 1]["O"];
	}

	var doAction = function(state) {
		if (state == 2) {
			result += "<COMMA/>";
			lexeme = "";
			currState = 1;
			return 1;
		} else if (state == 3) {
			result += "<COLON/>";
			lexeme = "";
			currState = 1;
			return 1;
		} else if (state == 4) {
			result += "<SEMICOLON/>";
			lexeme = "";
			currState = 1;
			return 1;
		} else if (state == 5) {
			result += "<NUMBER value='" + lexeme + "'/>";
			lexeme = "";
			currState = 1;
			return 1;
		} else if (state == 8) {
			result += "<TABLE value='" + lexeme.substr(1, lexeme.length - 2) + "'/>";
			lexeme = "";
			currState = 1;
			return -1;
		} else if (state == 10) {
			result += "<STRING value='" + lexeme.substr(0, lexeme.length - 1) + "'/>";
			lexeme = "";
			currState = 1;
			return -1;
		} else if (state == 12) {
			result += "<SECTIONSEPARATOR/>";
			lexeme = "";
			currState = 1;
			return 1;
		} else if (state == 13) {
			result += "<RELATION/>";
			lexeme = "";
			currState = 1;
			return 1;
		} else if (state == 14) {
			result += "<NEWLINE/>";
			lexeme = "";
			currLineNo++;
			currState = 1;
			return 1;
		} else if (state == 15) {
			error = "Error in lineNo#" + currLineNo;
			return 0;
		} else if (state == 16) {
			error = "Invalid Table name in lineNo#" + currLineNo;
			return 0;
		} else if (state == 17) {
			error = "Invalid token in lineNo#" + currLineNo;
			return 0;
		}
	}

	var runLex = function() {
		var script = getInput();
		for (var i = 0; i < script.length; i++) {
			var ch = script.charAt(i);
			lexeme += ch;
			currState = nextState(currState, ch);
			var act = doAction(currState);
			if (act == 0) break;
			if (act == -1) i--;
		}

		if (error != "") showError(error);
		else {
			result += "<END/>";
			return true;
		}
	}


	//=============Syntax Component==================IP: result(preserved) OP: syntax_valid;

	var tokens;
	var getFirstToken = function() {
		if (token == "") return "$";
		var start = tokens.indexOf("<");
		var end = tokens.indexOf("/>");
		var token = tokens.substring(start, end + 2);
		if (token.substr(0, 6) == "<COMMA") return "c";
		else if (token.substr(0, 6) == "<COLON") return "l";
		else if (token.substr(0, 10) == "<SEMICOLON") return "m";
		else if (token.substr(0, 7) == "<NUMBER") return "n";
		else if (token.substr(0, 6) == "<TABLE") return "t";
		else if (token.substr(0, 7) == "<STRING") return "s";
		else if (token.substr(0, 8) == "<SECTION") return "e";
		else if (token.substr(0, 9) == "<RELATION") return "r";
		else if (token.substr(0, 8) == "<NEWLINE") return "x";
		else if (token.substr(0, 4) == "<END") return "$";
	}

	var removeFirstToken = function() {
		var limit = tokens.indexOf("/>");
		//if(limit==-1) {tokens="";return;}
		tokens = tokens.substr(limit + 2);
	}

	var parseTable = {
		"P": {
			"t": "SeR",
			"e": "SeR"
		},
		"S": {
			"t": "tB",
			"e": "E"
		},
		"B": {
			"l": "lAmS",
			"mS": "m"
		},
		"A": {
			"s": "sC",
			"m": "E"
		},
		"C": {
			"c": "cA",
			"m": "E"
		},
		"R": {
			"r": "rtlD",
			"$": "E"
		},
		"D": {
			"n": "nlF",
			"s": "slG"
		},
		"F": {
			"n": "nltm",
			"s": "sltm"
		},
		"G": {
			"t": "TmR",
			"n": "nltmR",
			"s": "sltmR"
		},
		"T": {
			"t": "tH"
		},
		"H": {
			"c": "cT",
			"m": "E"
		}
	};

	var checkSyntax = function() {
		tokens = result;
		var stack = ["$", "P"];
		var error;
		var lineNo = 1;
		while (stack.length > 0) {
			var token = getFirstToken();
			if (token == "x") {
				removeFirstToken();
				lineNo++;
				continue;
			}
			var stacktop = stack[stack.length - 1];
			if (token == stacktop) {
				stack.pop();
				removeFirstToken();
			} else {
				var par = parseTable[stacktop];
				if (par == undefined) {
					error = "Syntax error @ lineNo#" + lineNo;
					break;
				}
				var rule = parseTable[stacktop][token];
				if (rule == undefined) {
					error = "Syntax error @ lineNo#" + lineNo;
					break;
				} else if (rule == "E") {
					stack.pop();
				} else {
					stack.pop();
					//push rule in reverse order
					for (var i = rule.length - 1; i >= 0; i--) {
						stack.push(rule.charAt(i));
					}

				}
			}
		}
		if (error == undefined) return true;
		else {
			showError(error);
			return false;
		}
	}
	//=============Semantic Components===============IP:result OP: ds
	var input;
	var tablelist = [];
	var tablemap = {};

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
				if (list[i].a_name == name) {
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

	var shiftTag = function() {
		var start = input.indexOf("<");
		var end = input.indexOf("/>");
		var token = input.substring(start, end + 2);
		input = input.substr(end + 2);
		return token;
	}

	var shiftPK = function(para1, para2) {
		var pk_list = tablemap[para2].getPK();
		for (var i = 0; i < pk_list.length; i++) {
			var type = "fk#" + para2 + ":" + pk_list[i].a_name;
			tablemap[para1].addA({
				a_name: pk_list[i].a_name,
				a_type: type
			})
		}
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
		var list1 = tablemap[para1].getPK();
		var list2 = tablemap[para2].getPK();
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
		tablemap[entity_name] = finallist;
		tablelist.push(entity_name);
	}

	var applyISA = function(para1, para2, childlist) {
		var complete_att = [];
		for (var i = 0; i < childlist.length; i++) {
			complete_att = complete_att.concat(tablemap[childlist[i]].getAttributes());
		}

		complete_att.sort(function(a, b) {
			return (a.a_name > b.a_name);
		});
		var comm_att = [];

		var count = 1;
		var comm_att = [];
		for (var i = 0; i < complete_att.length - 1; i++) {
			if (complete_att[i + 1] == undefined && count == childlist.length) {
				comm_att[comm_att.length] = complete_att[i];
			} else if (complete_att[i].a_name == complete_att[i + 1].a_name) count++;
			else {
				if (count == childlist.length) comm_att[comm_att.length] = complete_att[i];
				count = 1;
			}
		}

		for (var i = 0; i < comm_att.length; i++) {
			if (tablemap[para1].search(comm_att[i].a_name) == -1) {
				tablemap[para1].addA({
					a_name: comm_att[i].a_name,
					a_type: comm_att[i].a_type
				});
			}
		}
		for (var i = 0; i < comm_att.length; i++) {
			if (comm_att[i].a_type == "pk") continue;
			for (var j = 0; j < childlist.length; j++) {
				tablemap[childlist[j]].delAtt(comm_att[i].a_name);
			}
		}
	}

	var checkCommPK = function(childs) {
		var att_set = [];
		var map = {};
		var namelist = [];
		for (var i = 0; i < childs.length; i++) {
			var list = tablemap[childs[i]].getPK();
			for (var j = 0; j < list.length; j++) {
				if (map[list[j].a_name] == undefined) {
					map[list[j].a_name] = 1;
					namelist.push(list[j].a_name);
				} else {
					map[list[j].a_name]++;
				}
			}
		}
		for (var i = 0; i < namelist.length; i++) {
			if (map[namelist[i]] != childs.length) return false;
		}
		return true;

	}

	var applyMV = function(entityname) {
		var entity = tablemap[entityname];
		var list = entity.getAttributes();
		for (var i = 0; i < list.length; i++) {
			if (list[i].a_type == "mv") {
				var att_list = new CreateAttributeList();
				var newEntity = entityname + "_" + list[i].a_name.toUpperCase();
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
				tablemap[newEntity] = att_list;
				tablelist.push(newEntity);
			}
		}
		for (var i = 0; i < list.length; i++) {
			if (list[i].a_type == "mv") {
				list.splice(i, 1);
				i--;
			}
		}
	}

	var fetchValue = function(token) {
		var s = token.indexOf("='") + 2;
		return token.substring(s, token.indexOf("'", s));
	}

	var runSemantic = function() {
		input = result;
		var state = 1;
		var run = true;
		var lineno = 1;

		//Storage
		var currtable = "";
		var para1 = "";
		var para2 = "";
		var childlist = [];
		var op1 = "";
		var op2 = "";
		while (run) {
			//console.log(input);
			var token = shiftTag();
			if (token.substr(0, 6) == "<TABLE") {
				if (state == 1) {
					state = 2;
					currtable = fetchValue(token);
					currtable = currtable.toUpperCase();
					if (tablemap[currtable] === undefined) {

						tablelist.push(currtable);
						tablemap[currtable] = new CreateAttributeList();
					} else {
						run = false;
						console.log("Duplicate Table : " + currtable + " found @ lineNo#" + lineno);
					}
				} else if (state == 5) {
					state = 6;
					para1 = fetchValue(token);
					para1 = para1.toUpperCase();
					if (tablemap[para1] == undefined) {
						run = false;

						console.log("Unknown Table : " + para1 + " found @ lineNo#" + lineno);
					}
				} else if (state == 11) {
					state = 12;
					para2 = fetchValue(token);
					para2 = para2.toUpperCase();
					if (tablemap[para2] == undefined) {
						run = false;
						console.log("Unknown Table : " + para2 + " found @ lineNo#" + lineno);
					}
				} else if (state == 16 || state == 17) {
					state = 17;
					var tname = fetchValue(token);
					tname = tname.toUpperCase();

					if (tablemap[tname] == undefined) {

						run = false;
						console.log("Unknown Table : " + tname + " found @ lineNo#" + lineno);
					}
					childlist.push(tname);
				} else {
					run = false;
					console.log("Error at state : " + state);
				}
			} else if (token.substr(0, 6) == "<COLON") {
				if (state == 2) {
					state = 3;
				} else if (state == 6) {
					state = 7;
				} else if (state == 8) {
					state = 9;
				} else if (state == 10) {
					state = 11;
				} else if (state == 13) {
					state = 9;
				} else if (state == 14) {
					state = 11;
				} else if (state == 15) {
					state = 16;
				} else {
					run = false;
					console.log("Invalid Colon Position");
				}
			} else if (token.substr(0, 7) == "<STRING") {
				if (state == 3) {
					var att_val = fetchValue(token);
					att_val = att_val.toLowerCase();

					if (att_val.substr(-3) == "_pk") {
						var att_name = att_val.substring(0, att_val.length - 3);
						var att_type = "pk";
						if (tablemap[currtable].search(att_name) == -1) {
							tablemap[currtable].addA({
								a_name: att_name,
								a_type: att_type
							});
						} else {
							run = false;
							console.log("Duplicate Attribute : " + att_name + " in table : " + currtable + " @ lineNo#" + lineno);
						}
					} else if (att_val.substr(-3) == "_mv") {
						var att_name = att_val.substring(0, att_val.length - 3);
						var att_type = "mv";
						if (tablemap[currtable].search(att_name) == -1) {
							tablemap[currtable].addA({
								a_name: att_name,
								a_type: att_type
							});
						} else {
							run = false;
							console.log("Duplicate Attribute : " + att_name + " in table : " + currtable + " @ lineNo#" + lineno);
						}
					} else {
						var att_name = att_val;
						var att_type = "";
						if (tablemap[currtable].search(att_name) == -1) {
							tablemap[currtable].addA({
								a_name: att_name,
								a_type: att_type
							});
						} else {
							run = false;
							console.log("Duplicate Attribute : " + att_name + " in table : " + currtable + " @ lineNo#" + lineno);
						}
					}
				} else if (state == 7) {
					state = 13;
					op1 = fetchValue(token);
					op1 = op1.toUpperCase();
					if (op1 == "ISA") state = 15;
					else if (op1 != "M") {
						run = false;
						console.log("Invalid Relation Found @ lineNo#" + lineno);
					}
				} else if (state == 9) {
					state = 14;
					op2 = fetchValue(token);
					op2 = op2.toUpperCase()
					if (op2 != "M") {
						run = false;
						console.log("Invalid Relation Found @ lineNo#" + lineno);
					}
				} else {
					run = false;
					console.log("Invalid String Position");
				}
			} else if (token.substr(0, 10) == "<SEMICOLON") {
				if (state == 2 || state == 3) {
					state = 1;
					applyMV(currtable);
					currtable = "";
				} else if (state == 12) {
					state = 4;
					if (op1 == "1" && op2 == "1") {
						//Apply OneOne on para1 and para2
						applyOneOne(para1, para2);
					} else if (op1 == "1" && op2 == "M") {
						//Apply OneMany on para1 and para2		
						applyOneMany(para1, para2);
					} else if (op1 == "M" && op2 == "1") {
						//Apply ManyOne on para1 and para2
						applyManyOne(para1, para2);
					} else if (op1 == "M" && op2 == "M") {
						//Apply ManyMany on para1 and para2	
						applyManyMany(para1, para2);
					}
				} else if (state == 17) {
					if (checkCommPK(childlist)) {
						applyISA(para1, para2, childlist);
					} else {
						run = false;
						console.log("Tables : " + childlist.join(", ") + " don't have common primary key");
					}

				} else {
					run = false;
					console.log("Invalid Semicolon Position");
				}
			} else if (token.substr(0, 8) == "<SECTION") {
				if (state == 1) {
					state = 4;
				}
				/*run=false;
					console.log("Semantic analysis completed");
					console.log(tablemap);*/
			} else if (token.substr(0, 8) == "<NEWLINE") {
				lineno++;
			} else if (token.substr(0, 9) == "<RELATION") {
				if (state == 4) state = 5;
			} else if (token.substr(0, 7) == "<NUMBER") {
				if (state == 7) {
					var val = fetchValue(token);
					state = 8;
					if (val == "1") {
						op1 = val;
					} else {
						run = false;
						console.log("Invalid Relation Found @ lineNo#" + lineno);
					}

				} else if (state == 9) {
					var val = fetchValue(token);
					state = 10;
					if (val == "1") {
						op2 = val;
					} else {
						run = false;
						console.log("Invalid Relation Found @ lineNo#" + lineno);
					}

				}
			} else if (token.substr(0, 4) == "<END") {
				run = false;
				console.log(tablemap);
			}
		}

	}


	//================COMPILER Driver program=============
	this.start = function() {
		if (runLex()) {
			if (checkSyntax()) {
				runSemantic();
			}
		}
	}
}

	function gencode() {
		document.getElementById('error').innerHTML = "";
		var com = new Compiler(document.getElementById('script'), document.getElementById('error'));
		com.start();
	}