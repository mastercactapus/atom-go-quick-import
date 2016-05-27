package main

import (
	"bytes"
	"go/ast"
	"go/parser"
	"go/printer"
	"go/token"
	"strconv"

	"github.com/gopherjs/gopherjs/js"
	"golang.org/x/tools/go/ast/astutil"
)

// Import is the data for a go import
type Import struct {
	Name string
	Path string
}

func main() {

	exports := js.Module.Get("exports")
	exports.Set("AddImport", AddImport)
	exports.Set("ListImports", ListImports)
	exports.Set("RemoveImport", RemoveImport)
}

// AddImport will add an import to source code. It returns the new header as well as
// the length of the old one
func AddImport(source, path, alias string) (string, int) {
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "", source, parser.ParseComments|parser.ImportsOnly)
	if err != nil {
		panic(err)
	}
	end := int(f.End())
	for _, comm := range f.Comments {
		if int(comm.End()) > end {
			end = int(comm.End())
		}
	}

	astutil.AddNamedImport(fset, f, alias, path)
	ast.SortImports(fset, f)

	var buf bytes.Buffer

	err = printer.Fprint(&buf, fset, f)
	if err != nil {
		panic(err)
	}

	return buf.String(), end
}

// RemoveImport will remove an import from source code. It returns the new header
// as well as the length of the old one
func RemoveImport(source, path string) (string, int) {
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "", source, parser.ParseComments|parser.ImportsOnly)
	if err != nil {
		panic(err)
	}
	end := int(f.End())
	for _, comm := range f.Comments {
		if int(comm.End()) > end {
			end = int(comm.End())
		}
	}

	astutil.DeleteImport(fset, f, path)
	ast.SortImports(fset, f)

	var buf bytes.Buffer
	err = printer.Fprint(&buf, fset, f)
	if err != nil {
		panic(err)
	}

	return buf.String(), end
}

// ListImports will list imports used in source code
func ListImports(source string) []Import {
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "", source, parser.ImportsOnly)
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
