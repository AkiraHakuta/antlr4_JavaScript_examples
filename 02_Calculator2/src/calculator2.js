var antlr4 = require('antlr4/index');
var Expr2Lexer = require('./gen/Expr2Lexer').Expr2Lexer;
var Expr2Parser = require('./gen/Expr2Parser').Expr2Parser;
var Expr2Visitor = require('./gen/Expr2Visitor').Expr2Visitor;


function indent_sp_html(size)
{ 
    var result = '';
    for(let i = 0; i < size; i++)
        result += '&nbsp;';
    return result;
}


function beautify_lisp_string_html(in_string){
	var indent_size = 5;
    var curr_indent = 0;
    var out_string = in_string[0];

    for (let i = 1; i < in_string.length; i++){
    	if(in_string[i] == '(' &&  in_string[i+1] != ' '){
            curr_indent += indent_size;
            out_string += '<br>\n' + indent_sp_html(curr_indent) + '(';
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
	Expr2Visitor.call(this);
	return this;
}

Calc.prototype = Object.create(Expr2Visitor.prototype);
Calc.prototype.constructor = Calc;


Calc.prototype.visitStat = function(ctx) {
    return this.visit(ctx.expr());
};


Calc.prototype.visitParen = function(ctx) {
  return this.visit(ctx.expr());
};


Calc.prototype.visitPm_expr = function(ctx) {
    var result = this.visit(ctx.expr());
    if (ctx.op.text == '-')
        result = (-1)*result;
    return result;
};


Calc.prototype.visitMul_div = function(ctx) {
    var left  = this.visit(ctx.expr(0));
    var right = this.visit(ctx.expr(1));
    var result;
    if (ctx.op.text == '*')
        result = left * right;
    else
        result = left / right;
    return result;
};


Calc.prototype.visitInteger = function(ctx) {
    return Number(ctx.getText());
};


Calc.prototype.visitFloat = function(ctx) {
    return Number(ctx.getText());
};


Calc.prototype.visitExpo = function(ctx) {
    var left  = this.visit(ctx.expr(0));
    var right = this.visit(ctx.expr(1));
    
    return left ** right;
};


Calc.prototype.visitAdd_sub = function(ctx) {
    var left  = this.visit(ctx.expr(0));
    var right = this.visit(ctx.expr(1));
    var result;
    if (ctx.op.text == '+')
        result = left + right;
    else
        result = left - right;
    return result;
};






function calc_exe(expression){
    var chars = new antlr4.InputStream(expression);
    var lexer = new Expr2Lexer(chars);
    var tokens  = new antlr4.CommonTokenStream(lexer);
    var result_str = '';

    result_str += '<br>Tokens:[@tokenIndex,start:stop=\'text\',&lt;type&gt;(,channel=nr),line:column]\n';
    lexer._syntaxErrors = 0;
    lexer.removeErrorListeners();
    lexer.addErrorListener({
        syntaxError: (_this, _null, line, column, msg, e) => {
        result_str += '\n<br>Lexer Error:'+ `line ${line}:column ${column}: ${msg}` + '\n';
        lexer._syntaxErrors += 1;
        }
    });
    tokens.fill();
    if (lexer._syntaxErrors == 0){
        for (let i = 0; i < tokens.getNumberOfOnChannelTokens(); i++)
            result_str += '<br>'+tokens.get(i).toString() + '\n';
        result_str += '<br>';
        var parser = new Expr2Parser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener({
            syntaxError: (recognizer, offendingSymbol, line, column, msg, err) => {
            var _msg = `${msg}`.replace('<EOF>', '&lt;EOF&gt;');
            result_str += '\n<br>Parser Error:' + '&nbsp;&nbsp;' + `line ${line}:column ${column}: `+_msg + '\n';
            }
        });
        var tree = parser.stat();
        if (parser._syntaxErrors == 0){
            result_str += '<br>Parse tree (Lisp format):<br>';
            result_str += beautify_lisp_string_html(tree.toStringTree(parser.ruleNames));

            var result = new Calc().visitStat(tree);
            result_str += '\n<br><br>result:\n';
            result_str += tokens.getText() + '=' + result + '<br>';
        }
    }
    
    return result_str.replace('<EOF>', '&lt;EOF&gt;');
}


console.log(calc_exe('(100+3.3)*4-2/2^2'));

function exec(){
    var elem = document.getElementById("answer");
    var expr = document.getElementById("expression").value;
    //console.log(expr);
    document.getElementById("answer").innerHTML = calc_exe(expr);
};/**/


document.getElementById("expression")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        exec();
    }
});/**/


function clear_input(){
    document.getElementById("expression").value = "";
    document.getElementById("answer").innerHTML = "";
};/**/


document.getElementById("Button1").onclick = clear_input;
