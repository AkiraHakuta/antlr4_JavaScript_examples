// java.exe -jar C:/Javalib/antlr-4.8-complete.jar -Dlanguage=JavaScript -visitor -no-listener -o gen Expr2.g4

grammar Expr2;

stat : expr EOF;

expr:  <assoc=right> expr '^' expr # expo
    |  expr op=('*'|'/') expr      # mul_div
    |  op=('+'|'-') expr           # pm_expr
    |  expr op=('+'|'-') expr      # add_sub
    |  FLOAT                       # float
    |  INT                         # integer
    |  '(' expr ')'                # paren
    ;

FLOAT:  DIGIT*  '.' DIGIT+ ;
INT : DIGIT+ ;
fragment DIGIT: [0-9] ;
WS : [ \t\n\r]+ -> skip ;
