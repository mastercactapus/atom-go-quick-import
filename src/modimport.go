package main

import (
	"bytes"
	"github.com/gopherjs/gopherjs/js"
	"go/ast"
	"go/parser"
	"go/printer"
	"go/scanner"
	"go/token"
	"golang.org/x/tools/go/ast/astutil"
	"strconv"
)

// Import represents an imported package
// Name is the alias (if any) and Path is the import path
type Import struct {
	Name string
	Path string
}

func main() {
	exports := js.Module.Get("exports")
	exports.Set("AddImport", AddImport)
	exports.Set("ListImports", ListImports)
	exports.Set("RemoveImport", RemoveImport)
	exports.Set("Header", header)
}

func header(source string) (string, string) {
	src := []byte(source)
	var s scanner.Scanner
	fset := token.NewFileSet()
	file := fset.AddFile("", fset.Base(), len(src))
	s.Init(file, src, nil, 0)
	var pos token.Pos
	var tok token.Token
	for {
		pos, tok, _ = s.Scan()
		if tok == token.EOF {
			return source, ""
		}
		if tok == token.SEMICOLON || tok == token.PACKAGE || tok == token.IDENT || tok == token.STRING {
			continue
		}
		if tok == token.IMPORT || tok == token.LPAREN || tok == token.RPAREN {
			continue
		}

		return source[:pos-1], source[pos-1:]
	}
}

// AddImport will add an import to source code
func AddImport(source, path, alias string) string {
	header, body := header(source)
	if header == "" {
		panic("parse failure")
	}

	src := []byte(header)
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "", src, 0)
	if err != nil {
		panic(err)
	}

	astutil.AddNamedImport(fset, f, alias, path)
	ast.SortImports(fset, f)

	var buf bytes.Buffer
	err = printer.Fprint(&buf, fset, f)
	if err != nil {
		panic(err)
	}
	return buf.String() + "\n" + body
}

// RemoveImport will remove an import from source code
func RemoveImport(source, path string) string {
	header, body := header(source)
	if header == "" {
		panic("parse failure")
	}

	src := []byte(header)
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "", src, 0)
	if err != nil {
		panic(err)
	}

	astutil.DeleteImport(fset, f, path)
	ast.SortImports(fset, f)

	var buf bytes.Buffer
	err = printer.Fprint(&buf, fset, f)
	if err != nil {
		panic(err)
	}
	return buf.String() + "\n" + body
}

// ListImports will list imports used in source code
func ListImports(source string) []Import {
	header, _ := header(source)
	if header == "" {
		panic("parse failure")
	}

	src := []byte(header)
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "", src, 0)
	if err != nil {
		panic(err)
	}

	imports := make([]Import, len(f.Imports))
	for i, fi := range f.Imports {
		imports[i].Path, err = strconv.Unquote(fi.Path.Value)
		if err != nil {
			panic(err)
		}
		if fi.Name != nil {
			imports[i].Name = fi.Name.Name
		}
	}
	return imports
}
