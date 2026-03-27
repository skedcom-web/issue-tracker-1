export declare class CreateProjectDto {
    name: string;
    description?: string;
    department?: string;
    lead?: string;
    startDate?: string;
    endDate?: string;
}
export declare class UpdateProjectDto extends CreateProjectDto {
}
