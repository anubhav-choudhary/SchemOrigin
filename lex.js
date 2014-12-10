var lex=function () {
	var lexeme="";
	var currLineNo=1;
	var currState=1;
	var result="";
	var error="";
	
	var transTable=[
	{A:2,B:4,C:6,D:11,E:13,F:14,G:3,H:9,I:5,J:15,O:15},//1
	{},//2 <Comma Identified> return 1;
	{},//3 <Colon Identified> return 1;
	{},//4 <Semicolon Identified> return 1;
	{},//5 <Number Identified> return 1;
	{H:7,A:16,B:16,C:16,D:16,E:16,F:16,G:16,I:16,J:16,O:16},//6
	{H:7,I:7,J:7,A:8,B:8,C:8,D:8,E:8,F:8,G:8,O:8},//7
	{},//8 <TableName identified> return 1;
	{H:9,I:9,J:9,A:10,B:10,C:10,D:10,E:10,F:10,G:10,O:10},//9
	{},//10 <String identified> return 1;
	{D:12,A:17,B:17,C:17,E:17,F:17,G:17,H:17,I:17,J:17,O:17},//11
	{},//12 <Section Separator Identified> return 1;
	{},//13 <Relation Identified> return 1;
	{},//14 <new Line Identified> return 1;
	//Error States
	{},//15 Error in lineNo#; Stop
	{},//16 Invalid Table name in lineNo# Stop
	{},//17 Invalid token in lineNo#  Stop
	]
	
	var nextState=function (state,ch) {
		if(ch==",") return transTable[state-1]["A"];
		else if(ch==";") return transTable[state-1]["B"];
		else if(ch=="#") return transTable[state-1]["C"];
		else if(ch=="%") return transTable[state-1]["D"];
		else if(ch=="@") return transTable[state-1]["E"];
		else if(ch=="\n") return transTable[state-1]["F"];
		else if(ch==":") return transTable[state-1]["G"];
		else if( (ch.charCodeAt(0)>=65 && ch.charCodeAt(0) <=90) || (ch.charCodeAt(0)>=97 && ch.charCodeAt(0) <=122)) return transTable[state-1]["H"];
		else if(ch.charCodeAt(0)>=48 && ch.charCodeAt(0) <=57) return transTable[state-1]["I"];
		else if(ch=="_") return transTable[state-1]["J"];
		else return transTable[state-1]["O"];
		}
				
	
	var doAction=function(state){
		if(state==2)
		{
			result+="<COMMA/>";
			lexeme="";
			currState=1;
			return 1;
		}
		else if(state==3)
		{
			result+="<COLON/>";
			lexeme="";
			currState=1;
			return 1;		
		}	
		else if(state==4)
		{
			result+="<SEMICOLON/>";
			lexeme="";
			currState=1;
			return 1;		
		}
		else if(state==5)
		{
			result+="<NUMBER value='"+lexeme+"'/>";
			lexeme="";
			currState=1;
			return 1;
		}
		else if(state==8)
		{
			result+="<TABLE value='"+lexeme.substr(1,lexeme.length-2)+"'/>";
			lexeme="";
			currState=1;
			return -1;
		}
		else if(state==10)
		{
			result+="<STRING value='"+lexeme.substr(0,lexeme.length-1)+"'/>";
			lexeme="";
			currState=1;
			return -1;
		}
		else if(state==12)
		{
			result+="<SECTIONSEPARATOR/>";
			lexeme="";
			currState=1;
			return 1;
		}
		else if(state==13)
		{
			result+="<RELATION/>";
			lexeme="";
			currState=1;
			return 1;
		}
		else if(state==14)
		{
			result+="<NEWLINE/>";
			lexeme="";
			currLineNo++;
			currState=1;
			return 1;
		}

		else if(state==15)
		{
			error="Error in lineNo#"+currLineNo;
			return 0;
		}
		else if(state==16)
		{
			error="Invalid Table name in lineNo#"+currLineNo;
			return 0;
		}
		else if(state==17)
		{
			error="Invalid token in lineNo#"+currLineNo;
			return 0;
		}
	}
	
	this.runScript=function(script)
	{
			for(var i=0;i<script.length;i++)
			{
				var ch=script.charAt(i);
				lexeme+=ch;
				currState=nextState(currState,ch);
				var act=doAction(currState);
				if(act==0) break;	
				if(act==-1) i--;						
			}
			
			if(error!="") console.log(error);
			else{
			console.log(result+"<END/>");			
			}
	}
}

var obj=new lex();
obj.runScript("#Faculty:EmailId_pk,name;\n#Student:EmailId_pk,name,address;\n#Course:CourseId_pk,name;\n%%\n@#Faculty:M:1:#Course;\n@#Student:M:M:#Course;\n@#XYZ:ISA:#TEST;\n".trim());