package main

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"go/parser"
	"go/token"
	"testing"
)

const srcPkgOnly = `package main`
const srcNoImport = `package main

func main() {

}`
const srcNoGroup = `package main
import "fmt"`
const srcGroup = `package main
import (
	"fmt"
)
`

const manyImports = `package main
import "fmt"
import bob "foo"
import (a "b";c "d"

"f"
)
`

func getImports(t *testing.T, source string) {
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "", source, 0)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(f)
}

func TestHeader(t *testing.T) {
	exHead := `package main

`
	exBody := `func main() {

}`
	head, body := header(srcNoImport)
	assert.Equal(t, exHead, head, "header")
	assert.Equal(t, exBody, body, "body")
}

func TestAddImport(t *testing.T) {
	test := func(source, path, alias string, expected []Import, msg string) {
		result := AddImport(source, path, alias)
		t.Log(msg, "result:", result)
		imports := ListImports(result)
		assert.EqualValues(t, expected, imports, msg)
	}

	test(srcPkgOnly, "fmt", "", []Import{{"", "fmt"}}, "srcPkgOnly")
	test(srcPkgOnly, "fmt", "_", []Import{{"_", "fmt"}}, "srcPkgOnly alias")
	test(srcNoImport, "fmt", "", []Import{{"", "fmt"}}, "srcNoImport")
	test(srcNoGroup, "net", "", []Import{{"", "fmt"}, {"", "net"}}, "srcNoGroup")
	test(srcGroup, "net", "", []Import{{"", "fmt"}, {"", "net"}}, "srcGroup")

	result := AddImport(`package main

import (
	"fmt"
)
`, "net", "")
	assert.Equal(t, `package main

import (
	"fmt"
	"net"
)
`, result, "format check")
}

func TestListImports(t *testing.T) {
	imports := ListImports(manyImports)
	assert.Len(t, imports, 5, "number of imports")
	expected := []Import{{"", "fmt"}, {"bob", "foo"}, {"a", "b"}, {"c", "d"}, {"", "f"}}
	assert.EqualValues(t, expected, imports)
}
