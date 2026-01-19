# Test Results

## Test Summary

Ran 66 tests in 1s
| Result | Amount |
| --- | --- |
| 🟢 passed | 16 (24.2%) |
| 🟡 skipped | 8 (12.1%) |
| 🔴 failed | 8 (12.1%) |
| 🔴 error | 10 (15.2%) |

## Test Results

| Suite | Total | 🟢 Passed | 🟡 Skipped | 🔴 Failed | 🔴 Error | Duration |
| --- | --- | --- | --- | --- | --- | --- |
| 🔴 Namespace1_Artifact1_Type1.xml | 8 | 2 | 1 | <a href="#suite-namespace1artifact1type1xml-failed">1</a> | <a href="#suite-namespace1artifact1type1xml-error">1</a> | 1s |
| 🔴 Namespace1_Artifact1_Type2.xml | 8 | 2 | 1 | <a href="#suite-namespace1artifact1type2xml-failed">1</a> | <a href="#suite-namespace1artifact1type2xml-error">1</a> | 1s |
| 🔴 Namespace1_Artifact2_Type1.xml | 8 | 2 | 1 | <a href="#suite-namespace1artifact2type1xml-failed">1</a> | <a href="#suite-namespace1artifact2type1xml-error">1</a> | 1s |
| 🔴 Namespace1_Artifact2_Type2.xml | 8 | 2 | 1 | <a href="#suite-namespace1artifact2type2xml-failed">1</a> | <a href="#suite-namespace1artifact2type2xml-error">1</a> | 1s |
| 🔴 Namespace2_Artifact1_Type1.xml | 8 | 2 | 1 | <a href="#suite-namespace2artifact1type1xml-failed">1</a> | <a href="#suite-namespace2artifact1type1xml-error">1</a> | 1s |
| 🔴 Namespace2_Artifact1_Type2.xml | 8 | 2 | 1 | <a href="#suite-namespace2artifact1type2xml-failed">1</a> | <a href="#suite-namespace2artifact1type2xml-error">1</a> | 1s |
| 🔴 Namespace2_Artifact2_Type1.xml | 8 | 2 | 1 | <a href="#suite-namespace2artifact2type1xml-failed">1</a> | <a href="#suite-namespace2artifact2type1xml-error">1</a> | 1s |
| 🔴 Namespace2_Artifact2_Type2.xml | 8 | 2 | 1 | <a href="#suite-namespace2artifact2type2xml-failed">1</a> | <a href="#suite-namespace2artifact2type2xml-error">1</a> | 1s |
| 🔴 Namespace4_Artifact1_Type1.xml | 2 | 0 | 0 | 0 | <a href="#suite-namespace4artifact1type1xml-error">2</a> | 0s |

## Test Details

<a id="suite-namespace1artifact1type1xml"></a>


---


### Namespace1_Artifact1_Type1.xml Details

<a id="suite-namespace1artifact1type1xml-failed"></a>
#### failed

<details>
<summary><code>test_examples.test_failure</code></summary>



<pre><code>def test_failure():
&gt;       assert False
E       assert False

test_examples.py:10: AssertionError</code></pre>
</details>

<a id="suite-namespace1artifact1type1xml-error"></a>
#### error

<details>
<summary><code>test_examples.test_error</code></summary>



<pre><code>@pytest.fixture
    def failing_fixture():
&gt;       raise Exception("exception test_error")
E       Exception: exception test_error

test_examples.py:40: Exception</code></pre>
</details>

<a id="suite-namespace1artifact1type2xml"></a>


---


### Namespace1_Artifact1_Type2.xml Details

<a id="suite-namespace1artifact1type2xml-failed"></a>
#### failed

<details>
<summary><code>test_examples.test_failure</code></summary>



<pre><code>def test_failure():
&gt;       assert False
E       assert False

test_examples.py:10: AssertionError</code></pre>
</details>

<a id="suite-namespace1artifact1type2xml-error"></a>
#### error

<details>
<summary><code>test_examples.test_error</code></summary>



<pre><code>@pytest.fixture
    def failing_fixture():
&gt;       raise Exception("exception test_error")
E       Exception: exception test_error

test_examples.py:40: Exception</code></pre>
</details>

<a id="suite-namespace1artifact2type1xml"></a>


---


### Namespace1_Artifact2_Type1.xml Details

<a id="suite-namespace1artifact2type1xml-failed"></a>
#### failed

<details>
<summary><code>test_examples.test_failure</code></summary>



<pre><code>def test_failure():
&gt;       assert False
E       assert False

test_examples.py:10: AssertionError</code></pre>
</details>

<a id="suite-namespace1artifact2type1xml-error"></a>
#### error

<details>
<summary><code>test_examples.test_error</code></summary>



<pre><code>@pytest.fixture
    def failing_fixture():
&gt;       raise Exception("exception test_error")
E       Exception: exception test_error

test_examples.py:40: Exception</code></pre>
</details>

<a id="suite-namespace1artifact2type2xml"></a>


---


### Namespace1_Artifact2_Type2.xml Details

<a id="suite-namespace1artifact2type2xml-failed"></a>
#### failed

<details>
<summary><code>test_examples.test_failure</code></summary>



<pre><code>def test_failure():
&gt;       assert False
E       assert False

test_examples.py:10: AssertionError</code></pre>
</details>

<a id="suite-namespace1artifact2type2xml-error"></a>
#### error

<details>
<summary><code>test_examples.test_error</code></summary>



<pre><code>@pytest.fixture
    def failing_fixture():
&gt;       raise Exception("exception test_error")
E       Exception: exception test_error

test_examples.py:40: Exception</code></pre>
</details>

<a id="suite-namespace2artifact1type1xml"></a>


---


### Namespace2_Artifact1_Type1.xml Details

<a id="suite-namespace2artifact1type1xml-failed"></a>
#### failed

<details>
<summary><code>test_examples.test_failure</code></summary>



<pre><code>def test_failure():
&gt;       assert False
E       assert False

test_examples.py:10: AssertionError</code></pre>
</details>

<a id="suite-namespace2artifact1type1xml-error"></a>
#### error

<details>
<summary><code>test_examples.test_error</code></summary>



<pre><code>@pytest.fixture
    def failing_fixture():
&gt;       raise Exception("exception test_error")
E       Exception: exception test_error

test_examples.py:40: Exception</code></pre>
</details>

<a id="suite-namespace2artifact1type2xml"></a>


---


### Namespace2_Artifact1_Type2.xml Details

<a id="suite-namespace2artifact1type2xml-failed"></a>
#### failed

<details>
<summary><code>test_examples.test_failure</code></summary>



<pre><code>def test_failure():
&gt;       assert False
E       assert False

test_examples.py:10: AssertionError</code></pre>
</details>

<a id="suite-namespace2artifact1type2xml-error"></a>
#### error

<details>
<summary><code>test_examples.test_error</code></summary>



<pre><code>@pytest.fixture
    def failing_fixture():
&gt;       raise Exception("exception test_error")
E       Exception: exception test_error

test_examples.py:40: Exception</code></pre>
</details>

<a id="suite-namespace2artifact2type1xml"></a>


---


### Namespace2_Artifact2_Type1.xml Details

<a id="suite-namespace2artifact2type1xml-failed"></a>
#### failed

<details>
<summary><code>test_examples.test_failure</code></summary>



<pre><code>def test_failure():
&gt;       assert False
E       assert False

test_examples.py:10: AssertionError</code></pre>
</details>

<a id="suite-namespace2artifact2type1xml-error"></a>
#### error

<details>
<summary><code>test_examples.test_error</code></summary>



<pre><code>@pytest.fixture
    def failing_fixture():
&gt;       raise Exception("exception test_error")
E       Exception: exception test_error

test_examples.py:40: Exception</code></pre>
</details>

<a id="suite-namespace2artifact2type2xml"></a>


---


### Namespace2_Artifact2_Type2.xml Details

<a id="suite-namespace2artifact2type2xml-failed"></a>
#### failed

<details>
<summary><code>test_examples.test_failure</code></summary>



<pre><code>def test_failure():
&gt;       assert False
E       assert False

test_examples.py:10: AssertionError</code></pre>
</details>

<a id="suite-namespace2artifact2type2xml-error"></a>
#### error

<details>
<summary><code>test_examples.test_error</code></summary>



<pre><code>@pytest.fixture
    def failing_fixture():
&gt;       raise Exception("exception test_error")
E       Exception: exception test_error

test_examples.py:40: Exception</code></pre>
</details>

<a id="suite-namespace4artifact1type1xml"></a>


---


### Namespace4_Artifact1_Type1.xml Details

<a id="suite-namespace4artifact1type1xml-error"></a>
#### error

<details>
<summary><code>ParsingError.empty-file-error</code></summary>



<pre><code>Skipping empty file</code></pre>
</details>

<details>
<summary><code>ParsingError.metadata-parsing-error</code></summary>



<pre><code>Metadata could not be parsed from XML file</code></pre>
</details>

