
enum ProjectStatus {
    ACTIVE = "ACTIVE",
    DONE = "DONE",
}

type HTMLElementID = string;

type ProjectListenerFunction<T> = (projects: T[]) => void;

interface AppInterface {
    render(): void
}

interface InjectProjectStateInterface {
    projectState: ProjectState
}

type DragHandlerFunction = (event: DragEvent) => void;

interface Draggable {
    dragStartHandler: DragHandlerFunction;
    dragEndHandler: DragHandlerFunction;
}

interface DragTarget {
    dragOverHandler: DragHandlerFunction;
    dropHandler: DragHandlerFunction;
    dragLeaveHandler: DragHandlerFunction;
}


const Autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            return originalMethod.bind(this);
        }
    }
    return adjDescriptor;
}


const InjectProjectState = (projectStateProp = 'projectState') => (
    (constructor: Function) => {
        constructor.prototype[projectStateProp] = ProjectState.getInstance();
    }
)


class Project {
    constructor (
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus,
    ) {}
}

class State<T> {
    protected listeners: ProjectListenerFunction<T>[] = [];

    addListener(listenerFunction: ProjectListenerFunction<T>){
        this.listeners.push(listenerFunction);
    }
}

class ProjectState extends State<Project> {
    protected projects: Project[] = [];
    protected static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (!this.instance){
            this.instance = new ProjectState();
        }
        return this.instance;
    }

    addProject(project: Project) {
        this.projects.push(project);
        for (const listener of this.listeners) {
            listener(this.getProjects());
        }
    }

    private getProjects() {
        // Always return a new Array with am immutable Project object.
        return this.projects.map( project => Object.freeze(project) );
    }

}

 abstract class Component {
     
    protected hostElement: HTMLElement;
    protected insertElementPosition: InsertPosition;
    protected element: HTMLElement;

    constructor(templateElementID: HTMLElementID, hostElementID: HTMLElementID, insertElementPosition: InsertPosition){
        
        // Verify we have the target "template" element.
        const template = <HTMLTemplateElement> document.getElementById(templateElementID);
        if (!template) {
            throw new Error(`Template ${templateElementID} ID does not exists on DOM!`);
        }

        this.element = <HTMLElement> document.importNode(template.content ,true).firstElementChild;

        // Verify we have the target "host" element.
        const hostElement = document.getElementById(hostElementID);
        if (!hostElement) {
            throw new Error(`Host element ${hostElementID} ID does not exists on DOM!`);
        }
        
        this.hostElement = hostElement;
        this.insertElementPosition = insertElementPosition;
        this.insertElement();
    }

    private insertElement(){
        this.hostElement.insertAdjacentElement(this.insertElementPosition, this.element);
    }

    abstract render(): void
}


class App implements AppInterface {

    constructor(private elements: Component[] ){}

    public render(){
        for (const element of this.elements) {
            element.render();
        }
    }

}


@InjectProjectState()
class ProjectInputComponent extends Component {
    
    private titleInputElement: HTMLInputElement;
    private descriptionInputElement: HTMLInputElement;
    private peopleInputElement: HTMLInputElement;
    declare private projectState: ProjectState;

    constructor(templateElementID: HTMLElementID, hostElementID: HTMLElementID, insertElementPosition: InsertPosition){

        super(templateElementID, hostElementID, insertElementPosition);

        this.element.id = 'user-input';
        this.titleInputElement = <HTMLInputElement> this.element.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement> this.element.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement> this.element.querySelector('#people');
        this.element.addEventListener('submit', this.submitHandler);
    }

    private cleanForm() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @Autobind
    private submitHandler(event: Event){
        event.preventDefault();
        this.getProjectInputData();
    }

    private validateInputData(){
        const isTitle = this.titleInputElement.value && this.titleInputElement.value !== '';
        const isDescription  = this.descriptionInputElement.value && this.descriptionInputElement.value !== '';
        const isPeople = +this.peopleInputElement.value > 0;
        return isTitle && isDescription && isPeople;
    }

    private getProjectInputData() {

        if (!this.validateInputData()){
            alert('Please fill all inputs!');
            return
        }

        this.projectState.addProject(
            new Project(
                '_' + Math.random().toString(36).substr(2, 9), 
                this.titleInputElement.value,
                this.descriptionInputElement.value,
                +this.peopleInputElement.value,
                ProjectStatus.ACTIVE
            )
        );

        this.cleanForm();
    }

    render() {}

}

@InjectProjectState()
class ProjectListComponent extends Component implements DragTarget {
    
    private listElement: HTMLUListElement;
    private listType: ProjectStatus;
    projects: Project[] = [] 
    declare private projectState: ProjectState;

    constructor(
        templateElementID: HTMLElementID,
        hostElementID: HTMLElementID,
        insertElementPosition: InsertPosition,
        listType: ProjectStatus) {

        // Run Parent logic;
        super(templateElementID, hostElementID, insertElementPosition);

        this.listType = listType;

        this.element.id = `${this.listType.toLocaleLowerCase()}-projects`;
        const listId = `${this.listType.toLocaleLowerCase()}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.listElement = <HTMLUListElement> document.getElementById(listId)!;
        
        // Register a "listener" callback function that gets the most updated project State
        this.projectState.addListener(this.projectsStateListener);

        this.element.addEventListener('dragover',this.dragOverHandler);
        this.element.addEventListener('dragleave',this.dragLeaveHandler);
        this.element.addEventListener('drop',this.dropHandler);
    }

    @Autobind
    projectsStateListener(projects: Project[]) {
        this.projects = projects.filter(project => project.status === this.listType);
        this.renderProjects();
    }

    private renderProjects() {

        this.listElement.innerHTML = "";
        for (const project of this.projects) {
            const projectItem = new ProjectItem('single-project', this.listElement.id, 'beforeend', project);
            projectItem.render();

        }
    }

    @Autobind
    dragOverHandler(event: DragEvent) {
        this.listElement.classList.add('droppable');
        console.log('dragOverHandler',event);
    }

    @Autobind
    dropHandler(event: DragEvent) {
        console.log('dropHandler',event);
    }

    @Autobind
    dragLeaveHandler(event: DragEvent) {
        console.log('dragLeaveHandler',event);
        this.listElement.classList.remove('droppable');
    }

    render() {
        // Append the cloned template content into the host element.
        this.element.querySelector('h2')!.textContent = this.listType + ' projects';
    }

}


class ProjectItem extends Component implements Draggable {

    private project: Project;
    
    constructor(
        templateElementID: HTMLElementID,
        hostElementID: HTMLElementID,
        insertElementPosition: InsertPosition,
        project: Project,
        ){
        super(templateElementID, hostElementID, insertElementPosition);
        this.project = project;

        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    render(){
        this.element.querySelector('h2')!.textContent = this.project.title;
        const peopleText = ((this.project.people > 1) ? 'persons': 'person') +  ' assigned';
        this.element.querySelector('h3')!.textContent = `${this.project.people.toString()} ${peopleText}`; 
        this.element.querySelector('p')!.textContent = this.project.description;
    }

    @Autobind
    dragStartHandler(event: DragEvent) {
        console.log(event);

    }
    
    @Autobind
    dragEndHandler(_: DragEvent) {
        console.log('Drag ended!')
    }

    
}

const app = new App([
    new ProjectInputComponent('project-input','app', 'beforebegin'),
    new ProjectListComponent('project-list', 'app','beforeend', ProjectStatus.ACTIVE),
    new ProjectListComponent('project-list','app','beforeend',ProjectStatus.DONE)
]);

app.render();