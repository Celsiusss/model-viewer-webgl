import { vec3 } from "gl-matrix";

export function parseObj(source: string) {
    const vertices: number[] = [];
    const faces: number[] = [];
    const faceData: number[][][] = [];

    const lines = source.split('\n');

    const vertexNormals: number[][] = [];

    console.log('Loading obj');

    // Parsing the obj file
    for (let line of lines) {
        const args = line.split(' ').slice(1);

        switch(line.split(' ')[0]) {
            case 'v':
                vertices.push(...args.map(val => +val));
                break;
            case 'vn':
                vertexNormals.push(args.map(val => +val));
                break;
            case 'f':
                faceData.push(args.map(val => val.split('/').map(v => +v)));
                break;
        }
    }

    // Processing of faces data
    //
    // averages vertex normals
    // first store all normals per vertex, where the vertex id
    // is the index of the Map<number, any>
    // any is here of type number[][]
    // number[][] resembles the set of normals on this vertex

    let allNormals: Map<number, any> = new Map();
    for (let face of faceData) {
        face.forEach(([v, vt, vn], i) => {
            // obj files are 1-indexed, so we need to use v-1
            if (!allNormals.has(v-1)) {
                allNormals.set(v-1, []);
            }

            const normal = vertexNormals[vn-1];
            const normals = allNormals.get(v-1) as number[][];
            if (!normals.some(vec => vec3.equals(vec3.fromValues(vec[0], vec[1], vec[2]), vec3.fromValues(normal[0], normal[1], normal[2])))) {
                normals.push(vertexNormals[vn-1]);
                allNormals.set(v-1, normals);
            }

            // store faces
            faces.push(v-1);
        });
    }

    // average all normals per vertex
    for (let [i, normals] of allNormals as Map<number, number[][]>) {
        let avgNormal = normals.reduce(
            (prev, curr) => [
                prev[0] + curr[0],
                prev[1] + curr[1],
                prev[2] + curr[2]
            ]
        ).map(v => v / normals.length);
        allNormals.set(i, avgNormal);
    }
    // the map now has Map<number, number[]>

    // flatten
    let normals: number[] = [];
    for (let [i, normal] of allNormals) {
        normals[(i * 3) + 0] = normal[0];
        normals[(i * 3) + 1] = normal[1];
        normals[(i * 3) + 2] = normal[2];
    }
    console.log('Loaded obj');

    return { vertices, faces, normals };
}

export async function loadModel(name: string) {
    const res = await fetch(`/models/${name}.obj`);
    return await res.text();
}
