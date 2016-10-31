import Program from "../server/versioncontrol/Program";

export default IProgramStorage;

interface IProgramStorage {

    createProgram(name: string);

    deleteProgram(program: Program);

    getProgramNames(): Promise<string[]>;

    getProgram(name: string): Promise<Program>;


    //getBlob(programName: string, blogId: string);

    //getTree(programName: string, treeId: string);
}
