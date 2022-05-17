import mu from 'mu';
import { updateSudo } from '@lblod/mu-auth-sudo';

function sparqlify(node) {
  if (node.termType === 'NamedNode') {
    return mu.sparqlEscapeUri(node.value);
  } else if (node.termType === 'Literal') {
    if (node.datatype.value === 'http://www.w3.org/2001/XMLSchema#integer') {
      return mu.sparqlEscapeInt(node.value);
    } else if (node.datatype.value === 'http://www.w3.org/2001/XMLSchema#dateTime') {
      return mu.sparqlEscapeDate(node.value);
    } else {
      throw new Error('Unknown datatype ' + node.datatype.value);
    }
  } else {
    throw new Error('Unknown termType ' + node.termType);
  }
}

export async function writeToStore(graph) {
  let query = "INSERT DATA {\n";
  query = query + graph.match().map((quad) => {
    return (
      "GRAPH " + sparqlify(quad.graph) + "{ " +
        sparqlify(quad.subject) + " " +
        sparqlify(quad.predicate) + " " +
        sparqlify(quad.object) + " . }"
    );
  }).join("\n");
  query = query + "}";

  console.log(query);

  await updateSudo(query);
}
