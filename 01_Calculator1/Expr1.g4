// java.exe -jar C:/Javalib/antlr-4.8-complete.jar -Dlanguage=JavaScript -o gen Expr1.g4

grammar Expr1;

stat : expr EOF;

expr : <assoc=right> expr '^' expr # Expo
     | expr '*' expr               # Mult
     | expr '+'  expr              # Add
     | INT                         # Int
     ;

INT : [0-9]+ ;
WS : [ \t\n\r]+ -> skip ;
