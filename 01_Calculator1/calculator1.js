var antlr4 = require('antlr4/index');
var Expr1Lexer = require('./gen/Expr1Lexer').Expr1Lexer;
var Expr1Parser = require('./gen/Expr1Parser').Expr1Parser;
var Expr1Listener = require('./gen/Expr1Listener').Expr1Listener;


function indent_sp(size)
{ 
    var result = "";
    for(let i = 0; i < size; i++)
        result += " ";
    return result;
}


function beautify_lisp_string(in_string){
	var indent_size = 3;
    var curr_indent = 0;
    var out_string = in_string[0];

    for (let i = 1; i < in_string.length; i++){
    	if(in_string[i] == '(' &&  in_string[i+1] != ' '){
            curr_indent += indent_size;
           out_string += '\n' + indent_sp(curr_indent) + '(';
        }
        else if(in_string[i] == ')'){
            out_string += ')';
            if(curr_indent > indent_size)
                curr_indent -= indent_size;
        }
        else
            out_string += in_string[i];
  	}

	return out_string;
}



function Calc() {
    Expr1Listener.call(this);
    this.result;
    this.memory = {};
    return this;
}

Calc.prototype = Object.create(Expr1Listener.prototype);
Calc.prototype.constructor = Calc;


Calc.prototype.enterStat = function(ctx) {
};

Calc.prototype.exitStat = function(ctx) {
    this.result = this.memory[ctx.expr()];
};


Calc.prototype.enterAdd = function(ctx) {
};

Calc.prototype.exitAdd = function(ctx) {
    var left = this.memory[ctx.expr(0)];
    var right  = this.memory[ctx.expr(1)];
    this.memory[ctx] = left + right;
};


Calc.prototype.enterExpo = function(ctx) {
};

Calc.prototype.exitExpo = function(ctx) {
    var left = this.memory[ctx.expr(0)];
    var right  = this.memory[ctx.expr(1)];
    this.memory[ctx] = left ** right;
};


Calc.prototype.enterMult = function(ctx) {
};

Calc.prototype.exitMult = function(ctx) {
    var left = this.memory[ctx.expr(0)];
    var right  = this.memory[ctx.expr(1)];
    this.memory[ctx] = left * right;
};


Calc.prototype.enterInt = function(ctx) {
};

Calc.prototype.exitInt = function(ctx) {
    this.memory[ctx] = Number(ctx.getText());
};



var chars = new antlr4.InputStream('100+3*4+2^3^2');
var lexer = new Expr1Lexer(chars);
var tokens  = new antlr4.CommonTokenStream(lexer);

console.log('Tokens:[@tokenIndex,start:stop=\'text\',<type>(,channel=nr),line:column]');
for (let i = 0; i < tokens.getNumberOfOnChannelTokens(); i++)
	console.log(tokens.get(i).toString());

var parser = new Expr1Parser(tokens);
var tree = parser.stat();

console.log("\nParse tree (Lisp format):");
console.log(beautify_lisp_string(tree.toStringTree(parser.ruleNames)));

var listener = new Calc();
antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);
console.log("\nresult:");
console.log(tokens.getText() + '=' + listener.result + '\n\n');
