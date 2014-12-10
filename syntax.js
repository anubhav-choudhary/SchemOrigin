var syntax=function () {
	var tokens="<TABLE value='Faculty'/><COLON/><STRING value='EmailId_pk'/><COMMA/><STRING value='name'/><SEMICOLON/><NEWLINE/><TABLE value='Student'/><COLON/><STRING value='EmailId_pk'/><COMMA/><STRING value='name'/><COMMA/><STRING value='address'/><SEMICOLON/><NEWLINE/><TABLE value='Course'/><COLON/><STRING value='CourseId_pk'/><COMMA/><STRING value='name'/><SEMICOLON/><NEWLINE/><SECTIONSEPARATOR/><NEWLINE/><RELATION/><TABLE value='Faculty'/><COLON/><STRING value='M'/><COLON/><NUMBER value='1'/><COLON/><TABLE value='Course'/><SEMICOLON/><NEWLINE/><RELATION/><TABLE value='Student'/><COLON/><STRING value='M'/><COLON/><STRING value='M'/><COLON/><TABLE value='Course'/><SEMICOLON/><NEWLINE/><RELATION/><TABLE value='XYZ'/><COLON/><STRING value='ISA'/><COLON/><TABLE value='TEST'/><SEMICOLON/><END/>";
	var getFirstToken=function(){
		if(token=="") return "$";
			var start=tokens.indexOf("<");
			var end=tokens.indexOf("/>");
			var token=tokens.substring(start,end+2);
			if(token.substr(0,6)=="<COMMA") return "c";
			else if(token.substr(0,6)=="<COLON") return "l";
			else if(token.substr(0,10)=="<SEMICOLON") return "m";
			else if(token.substr(0,7)=="<NUMBER") return "n";
			else if(token.substr(0,6)=="<TABLE") return "t";
			else if(token.substr(0,7)=="<STRING") return "s";
			else if(token.substr(0,8)=="<SECTION") return "e";
			else if(token.substr(0,9)=="<RELATION") return "r";
			else if(token.substr(0,8)=="<NEWLINE") return "x";
			else if(token.substr(0,4)=="<END") return "$";
	}
	
	var removeFirstToken=function(){
		var limit=tokens.indexOf("/>");
		//if(limit==-1) {tokens="";return;}
		tokens=tokens.substr(limit+2);
	}	
	
	var parseTable={
	"P":{"t":"SeR","e":"SeR"},
	"S":{"t":"tB","e":"E"},
	"B":{"l":"lAmS","mS":"m"},
	"A":{"s":"sC","m":"E"},
	"C":{"c":"cA","m":"E"},
	"R":{"r":"rtlD","$":"E"},
	"D":{"n":"nlF","s":"slG"},
	"F":{"n":"nltm","s":"sltm"},
	"G":{"t":"TmR","n":"nltmR","s":"sltmR"},
	"T":{"t":"tH"},
	"H":{"c":"c","m":"E"}	
	};
	
	this.checkSyntax=function()
	{
		var stack=["$","P"];
		var error;
		var lineNo=1;
		while(stack.length>0)
		{
			var token=getFirstToken();
			if(token=="x") {removeFirstToken();lineNo++;continue;} 
			var stacktop=stack[stack.length-1];
			if(token==stacktop)
			{
				stack.pop();
				removeFirstToken();			
			}
			else {
				var par=parseTable[stacktop];
				if(par==undefined) {error="Syntax error @ lineNo#"+lineNo;break;}
				var rule=parseTable[stacktop][token];
				if(rule==undefined) {error="Syntax error @ lineNo#"+lineNo;break;}
				else if(rule=="E")
				{
					stack.pop();				
				}
				else {
					stack.pop();
					//push rule in reverse order
					for(var i=rule.length-1;i>=0;i--)
					{
						stack.push(rule.charAt(i));					
					}
									
				}				
			}		
		}
		if(error==undefined) console.log("Syntax Correct");
		else {console.log(error);}	
	}
}

var obj=new syntax();
obj.checkSyntax();