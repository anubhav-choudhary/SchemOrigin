var semantic = function()
{
	var input="<TABLE value='Faculty'/><COLON/><STRING value='EmailId_pk'/><COMMA/><STRING value='name'/><SEMICOLON/><NEWLINE/><TABLE value='Student'/><COLON/><STRING value='EmailId_pk'/><COMMA/><STRING value='name'/><COMMA/><STRING value='address'/><SEMICOLON/><NEWLINE/><TABLE value='Course'/><COLON/><STRING value='CourseId_pk'/><COMMA/><STRING value='name'/><SEMICOLON/><NEWLINE/><SECTIONSEPARATOR/><NEWLINE/><RELATION/><TABLE value='Faculty'/><COLON/><STRING value='M'/><COLON/><NUMBER value='1'/><COLON/><TABLE value='Course'/><SEMICOLON/><NEWLINE/><RELATION/><TABLE value='Student'/><COLON/><STRING value='M'/><COLON/><STRING value='M'/><COLON/><TABLE value='Course'/><SEMICOLON/><NEWLINE/><RELATION/><TABLE value='STudent'/><COLON/><STRING value='ISA'/><COLON/><TABLE value='faculty'/><SEMICOLON/><END/>";
	
	//Res
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
				if (list[i].name == name) {
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
	
	var tablelist=[];
	var tablemap={};
	
	var shiftTag=function () {
			var start=input.indexOf("<");
			var end=input.indexOf("/>");
			var token=input.substring(start,end+2);
			input=input.substr(end+2);
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
		tablemap[entity_name]=finallist;
		tablelist.push(entity_name);
	}
	
	var applyISA = function(para1, para2,childlist) {
		var complete_att = [];
		for (var i = 0; i < childlist.length; i++) {
			complete_att = complete_att.concat(tablemap[childlist[i]].getAttributes());
		}
		complete_att.sort(function(a, b) {
			return (a.a_name > b.a_name);
		});
		var count = 1;
		var comm_att = [];
		for (var i = 1; i < complete_att.length; i++) {
			if (complete_att[i].a_name == complete_att[i - 1].a_name) count++;
			else count = 1;
			if (count == childlist.length) comm_att[comm_att.length] = complete_att[i];
		}
		for (var i = 0; i < comm_att.length; i++) {
			if(tablemap[para1].search(comm_att[i].a_name)==-1) alert("h");
			tablemap[para1].addA({
				a_name: comm_att[i].a_name,
				a_type: comm_att[i].a_type
			});
		}
		for (var i = 0; i < comm_att.length; i++) {
			if (comm_att[i].a_type == "pk") continue;
			for (var j = 0; j < childlist.length; j++) {
				tablemap[childlist[j]].delAtt(comm_att[i].a_name);
			}
		}
	}
	
	var fetchValue=function(token){
		var s=token.indexOf("='")+2;
			return token.substring(s,token.indexOf("'",s));
	}
	
	var process=function () {
		var state=1;
		var run=true;
		var lineno=1;
		
		//Storage
		var currtable="";
		var para1="";
		var para2="";
		var childlist=[];
		var op1="";
		var op2="";
		while(run)
		{
			//console.log(input);
				var token=shiftTag();
				if(token.substr(0,6)=="<TABLE")
				{
					if(state==1)
					{
						state=2;
						currtable=fetchValue(token);
						currtable=currtable.toUpperCase();
						if(tablemap[currtable]===undefined)
						{
							
							tablelist.push(currtable);
							tablemap[currtable]= new CreateAttributeList();
						}
						else {
						run=false;
						console.log("Duplicate Table : "+currtable + " found @ lineNo#"+lineno);					
						}
					}
					else if(state==5)
					{
						state=6;		
						para1=fetchValue(token);
						para1=para1.toUpperCase();
						if(tablemap[para1]==undefined)
						{
							run=false;
							console.log("Unknown Table : "+para1 + " found @ lineNo#"+lineno);						
						}			
					}
					else if(state==11)
					{
						state=12;
						para2=fetchValue(token);
						para2=para2.toUpperCase();
						if(tablemap[para2]==undefined)
						{
							run=false;
							console.log("Unknown Table : "+para1 + " found @ lineNo#"+lineno);						
						}					
					}
					else if(state==16 || state==17)
					{
						state=17;
						var tname=fetchValue(token);
						tname=tname.toUpperCase();
						
						if(tablemap[tname]==undefined)
						{
							
							run=false;
							console.log("Unknown Table : "+tname + " found @ lineNo#"+lineno);						
						}
						childlist.push(tname);
					}
					else{
						run=false;
						console.log("Error at state : "+state);
					}
				}
				else if(token.substr(0,6)=="<COLON")
				{
					if(state==2) 
					{
						state=3;
					}
					else if(state==6) {
						state=7;
					}
					else if(state==8) {
						state=9;
					}
					else if(state==10)
					{
						state=11;					
					}
					else if(state==13)
					{
						state=9;					
					}
					else if(state==14)
					{
						state=11;					
					}
					else if(state==15)
					{
						state=16;					
					}
					else{
						run=false;
						console.log("Invalid Colon Position");
					}
				}
				else if(token.substr(0,7)=="<STRING")
				{
					if(state==3) 
					{
						var att_val=fetchValue(token);
						att_val=att_val.toLowerCase();
										
						if(att_val.substr(-3)=="_pk")
						{
							var att_name=att_val.substring(0,att_val.length-3);
							var  att_type="pk";
							if(tablemap[currtable].search(att_name)==-1)
							{
									tablemap[currtable].addA({a_name: att_name,a_type: att_type});
							}
							else {
										run=false;
										console.log("Duplicate Attribute : "+att_name + " in table : "+currtable+" @ lineNo#"+lineno);				
							}
						}
						else if(att_val.substr(-3)=="_mv")
						{
							var att_name=att_val.substring(0,att_val.length-3);
							var  att_type="mv";
							if(tablemap[currtable].search(att_name)==-1)
							{
									tablemap[currtable].addA({a_name: att_name,a_type: att_type});
							}
							else {
										run=false;
										console.log("Duplicate Attribute : "+att_name + " in table : "+currtable+" @ lineNo#"+lineno);				
							}					
						}
						else{
							var att_name=att_val;
							var  att_type="";
							if(tablemap[currtable].search(att_name)==-1)
							{
									tablemap[currtable].addA({a_name: att_name,a_type: att_type});
							}
							else {
										run=false;
										console.log("Duplicate Attribute : "+att_name + " in table : "+currtable+" @ lineNo#"+lineno);				
							}						
						}
					}
					else if(state==7)
					{
						state=13;
						op1=fetchValue(token);
						op1=op1.toUpperCase();
						if(op1=="ISA") state=15;
						else if(op1!="M")
						{
							run=false;
							console.log("Invalid Relation Found @ lineNo#"+lineno);
						}					
					}
					else if(state==9)
					{
						state=14;
						op2=fetchValue(token);
						op2=op2.toUpperCase()
						if(op2!="M")
						{
							run=false;
							console.log("Invalid Relation Found @ lineNo#"+lineno);
						}					
					}
					else{
						run=false;
						console.log("Invalid String Position");
					}
				}
				else if(token.substr(0,10)=="<SEMICOLON")
				{
					if(state==2|| state==3)
					{
						state=1;
						currtable="";					
					}
					else if(state==12)
					{
						state=4;
						if(op1=="1" && op2=="1")
						{
								//Apply OneOne on para1 and para2
								applyOneOne(para1,para2);					
						}
						else if(op1=="1" && op2=="M")	
						{
								//Apply OneMany on para1 and para2		
								applyOneMany(para1,para2);				
						}
						else if(op1=="M" && op2=="1")	
						{
								//Apply ManyOne on para1 and para2
								applyManyOne(para1,para2);							
						}
						else if(op1=="M" && op2=="M")	
						{
								//Apply ManyMany on para1 and para2
								console.log("apply M:M");	
								applyManyMany(para1,para2);						
						}		
					}
					else if(state==17)
					{
						//and validate;	
						console.log("apply ISA");
						applyISA(para1,para2,childlist);
										
					}
					else{
						run=false;
						console.log("Invalid Semicolon Position");
					}	
				}
				else if(token.substr(0,8)=="<SECTION")
				{
					if(state==1) {state=4;}
					/*run=false;
					console.log("Semantic analysis completed");
					console.log(tablemap);*/
				}
				else if(token.substr(0,8)=="<NEWLINE")
				{
					lineno++;				
				}
				else if(token.substr(0,9)=="<RELATION")
				{
					if(state==4) state=5;
				}
				else if(token.substr(0,7)=="<NUMBER")
				{
					if(state==7)
					{
						var val=fetchValue(token);
						state=8;
						if(val=="1")
						{
							op1=val;						
						}
						else {
							run=false;
							console.log("Invalid Relation Found @ lineNo#"+lineno);					
						}
											
					}
					else if(state==9)
					{
						var val=fetchValue(token);
						state=10;
						if(val=="1")
						{
							op2=val;						
						}
						else {
							run=false;
							console.log("Invalid Relation Found @ lineNo#"+lineno);					
						}
											
					}				
				}
				else if(token.substr(0,4)=="<END")
				{
					run=false;
					console.log("Semantic analysis completed");
					console.log(tablemap);
				}
		}
		
	}
	return{
		shift:shiftTag,
		start:process	
	}
}
var obj=new semantic();