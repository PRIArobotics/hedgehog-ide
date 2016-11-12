import Program from "./Program";
import Blob from "./Blob";
import Tree from "./Tree";
import Version from "./Version";
import WorkingTree from "./WorkingTree";
import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTreeFile from "./WorkingTreeFile";

export default IProgramStorage;

/**
 * A program storage handles low level program management.
 * Programs can be either managed and manipulated directly with
 * a program store or in a more object oriented manner through
 * wrapper objects.
 */
interface IProgramStorage {

    /**
     * Create a new program
     *
     * @param name Name of the program
     */
    createProgram(name: string): Promise<Program>;

    /**
     * Delete a program permanently
     *
     * @param program Program which should be deleted
     */
    deleteProgram(name: string): Promise<void>;

    /**
     * Returns an array of all programs stored in the ProgramStorage
     *
     * @return List of program names
     */
    getProgramNames(): Promise<string[]>;

    /**
     * Get a program stored in the program storage
     *
     * @param name {@link Program} instance
     */
    getProgram(name: string): Promise<Program>;

    /**
     * Rename a program
     *
     * @param oldName Current name
     * @param newName New name
     */
    renameProgram(oldName: string, newName: string): Promise<void>;

    /**
     * Resets the program to a specific version
     *
     * This operation will delete all versions after the specified version.
     * (Internally it will perform a git reset operation which makes all later version inaccessible.)
     *
     * @param programName
     * @param versionId SHA of the version
     */
    resetProgram(programName: string, versionId: string): Promise<void>;


    /**
     * Get a blob object of a program (aka a file)
     *
     * @param programName
     * @param blobId SHA of the blob
     */
    getBlob(programName: string, blobId: string): Promise<Blob>;

    getBlobContent(programName: string, blobId: string, encoding?: string): Promise<string>;

    /**
     * Get a tree object of a program (aka a directory)
     *
     * @param programName
     * @param treeId SHA of the tree
     */
    getTree(programName: string, treeId: string): Promise<Tree>;

    /**
     * Get an array of all versions of a program
     *
     * @param programName
     * @returns array of the version's SHA hashes as string
     */
    getVersionIds(programName: string): Promise<string[]>;

    /**
     * Get a single version
     *
     * @param programName
     * @param versionId SHA of the version
     * @returns the requested version object
     */
    getVersion(programName: string, versionId: string): Promise<Version>;


    /**
     * Create a new version from the workingtree contents
     *
     * @param programName
     * @returns the newly created version's id
     */
    createVersionFromWorkingTree(programName: string, message: string, tag?: string): Promise<string>;


    /**
     * Get the workingtree for a program
     *
     * @param programName
     * @returns the working tree object
     */
    getWorkingTree(programName: string): WorkingTree;

    /**
     * Get a directory of a program's working tree
     *
     * @param programName
     * @param path full directory path
     * @returns the requested working tree directory
     */
    getWorkingTreeDirectory(programName: string, path: string): Promise<WorkingTreeDirectory>;

    /**
     * Get a file from the workingtree
     *
     * @param programName
     * @param path full file path
     * @returns the requested working tree file
     */
    getWorkingTreeFile(programName: string, path: string): Promise<WorkingTreeFile>;

    getWorkingTreeFileContent(programName: string, path: string, encoding?: string): Promise<string>;

    /**
     * Create a new directory in the workingtree of a program
     *
     * @param programName
     * @param path full path for the new directory
     * @param mode Unix file system permissions as octal number
     */
    createWorkingTreeDirectory(programName: string, path: string, mode?: number): void;

    /**
     * Create a new file in the workingtree of a program
     *
     * @param programName
     * @param path full path for the new file
     * @param content file content
     * @param encoding file encoding (default UTF-8)
     * @param mode Unix file system permissions as octal number
     */
    createWorkingTreeFile(programName: string, path: string, content: string, mode?: number): void;

    updateWorkingTreeObject(programName: string, path: string, mode: number): void;

    deleteWorkingTreeFile(programName: string, path: string): void;

    deleteWorkingTreeDirectory(programName: string, path: string): void;

    /**
     * Reset the workingtree to the latest version
     *
     * Clears both untracked files and reset the index and tracked files.
     * @param programName
     */
    resetWorkingTree(programName: string);
}
