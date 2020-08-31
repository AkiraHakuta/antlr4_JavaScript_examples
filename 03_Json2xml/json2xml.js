var antlr4 = require('antlr4/index');
var JsonLexer = require('./gen/JsonLexer').JsonLexer;
var JsonParser = require('./gen/JsonParser').JsonParser;
var JsonListener = require('./gen/JsonListener').JsonListener;


indent_sp = function(size) { 
    var result = "";
    for(let i = 0; i < size; i++)
        result += " ";
    return result;
}


beautify_lisp_string = function (in_string) {
	var indent_size = 4;
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


function ParseTreeProperty() {
    this.tokenIndex_dict = {};
}

ParseTreeProperty.prototype.get = function(ctx) {
 return this.tokenIndex_dict[ctx.start.tokenIndex]; 
}

ParseTreeProperty.prototype.put = function(ctx, value) {
    this.tokenIndex_dict[ctx.start.tokenIndex] = value; 
}



depth_sp = function(depth1){   
    var indent_size = 3;
    var result = '';
    for(let i = 0; i < indent_size*depth1; i++)
        result += ' ';
    return result;
}



function Json2xml(xml) {
    JsonListener.call(this);
    this.xml = xml;
    this.depth = -1;
    return this;
}

Json2xml.prototype = Object.create(JsonListener.prototype);
Json2xml.prototype.constructor = Json2xml;

Json2xml.prototype.enterJson = function(ctx) {    
};

Json2xml.prototype.exitJson = function(ctx) {
    this.xml.put(ctx, xml.get(ctx.element()));
};


Json2xml.prototype.enterElement = function(ctx) {
};

Json2xml.prototype.exitElement = function(ctx) {
    this.xml.put(ctx, xml.get(ctx.value()));
};


Json2xml.prototype.enterObjectValue = function(ctx) {
    this.depth++;
};

Json2xml.prototype.exitObjectValue = function(ctx) {
    this.xml.put(ctx, xml.get(ctx.object()));
    this.depth--;
};


Json2xml.prototype.enterArrayValue = function(ctx) {
    this.depth++;
};

Json2xml.prototype.exitArrayValue = function(ctx) {
    this.xml.put(ctx, xml.get(ctx.array()));
    this.depth--;
};


Json2xml.prototype.enterString = function(ctx) {
};

Json2xml.prototype.exitString = function(ctx) {
    var str1 = ctx.getText();
    str1 = str1.substr(1, str1.length-2);
    this.xml.put(ctx, str1);
};


Json2xml.prototype.enterAtom = function(ctx) {
};

Json2xml.prototype.exitAtom = function(ctx) {
    this.xml.put(ctx, ctx.getText());
};


Json2xml.prototype.enterEmptyObject = function(ctx) {
};

Json2xml.prototype.exitEmptyObject = function(ctx) {
    this.xml.put(ctx, '');
};


Json2xml.prototype.enterAnObject = function(ctx) {
};

Json2xml.prototype.exitAnObject = function(ctx) {
    var buf = "\n";
    
    for (let i = 0; ; i++){                
        mctx =  ctx.member(i);
        if(mctx === null)
            break;
        buf += this.xml.get(mctx);                
    }
    this.xml.put(ctx, buf + depth_sp(this.depth-1));

};


Json2xml.prototype.enterEmptyArray = function(ctx) {
};

Json2xml.prototype.exitEmptyArray = function(ctx) {
    this.xml.put(ctx, '');
};


Json2xml.prototype.enterArrayOfValues = function(ctx) {
};

Json2xml.prototype.exitArrayOfValues = function(ctx) {
    var buf = "\n";
    for (let i = 0; ; i++){                
        mctx = ctx.element(i);
        if(mctx === null)
            break;
        buf +=  depth_sp(this.depth) + "<element>" + this.xml.get(mctx) + "</element>\n";              
    }
    this.xml.put(ctx, buf + depth_sp(this.depth-1));
};


Json2xml.prototype.enterMember = function(ctx) {
};

Json2xml.prototype.exitMember = function(ctx) {
    var tag = ctx.STRING().getText();
    tag = tag.substr(1, tag.length-2);
    ectx = ctx.element();
    x =  depth_sp(this.depth) + "<"+tag+">" + this.xml.get(ectx) + "</"+tag+">\n";
    this.xml.put(ctx, x);
};





var xml = new ParseTreeProperty();
var chars = new antlr4.FileStream('test.json');
var lexer = new JsonLexer(chars);
var tokens  = new antlr4.CommonTokenStream(lexer);

console.log('Tokens:[@tokenIndex,start:stop=\'text\',<type>(,channel=nr),line:column]');
for (let i = 0; i < tokens.getNumberOfOnChannelTokens(); i++)
	console.log(tokens.get(i).toString());

var parser = new JsonParser(tokens);
var tree = parser.json();

console.log("\nParse tree (Lisp format):");
console.log(beautify_lisp_string(tree.toStringTree(parser.ruleNames)));

var j2x = new Json2xml(xml);
antlr4.tree.ParseTreeWalker.DEFAULT.walk(j2x, tree);

console.log('\nxml code:', j2x.xml.get(tree));
