import {
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { BoardColumn, BoardItem } from '@tegonhq/ui/components/board';
import { ScrollArea } from '@tegonhq/ui/components/scroll-area';
import { Project } from '@tegonhq/ui/icons';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { BoardIssueItem } from 'modules/issues/components/issue-board-item';

import type { ProjectType } from 'common/types';
import type { IssueType } from 'common/types';

import { useCycle } from 'hooks/cycles';
import { useCurrentTeam } from 'hooks/teams';
import { useComputedWorkflows } from 'hooks/workflows';

import { useContextStore } from 'store/global-context-provider';

import { useFilterIssues } from '../../../../issues-utils';

interface ProjectBoardListProps {
  project: ProjectType;
}

export const ProjectBoardList = observer(
  ({ project }: ProjectBoardListProps) => {
    const { issuesStore, applicationStore } = useContextStore();
    const team = useCurrentTeam();
    const { workflows } = useComputedWorkflows();
    const cycle = useCycle();

    const issues = issuesStore.getIssuesForProject({
      teamId: team?.id,
      projectId: project?.id,
      cycleId: cycle?.id,
    });

    const computedIssues = useFilterIssues(issues, workflows);

    if (
      computedIssues.length === 0 &&
      !applicationStore.displaySettings.showEmptyGroups
    ) {
      return null;
    }
    return (
      <BoardColumn key={project.id} id={project.id}>
        <div className="flex flex-col max-h-[100%]">
          <div className="flex gap-1 items-center mb-2">
            <div className="inline-flex items-center w-fit h-8 rounded-2xl px-4 py-2 gap-1 min-w-[0px] bg-grayAlpha-100">
              <Project size={14} className="h-5 w-5 text-[9px] shrink-0" />
              <div className="truncate"> {project.name}</div>
            </div>

            <div className="rounded-2xl bg-grayAlpha-100 p-1.5 px-2 font-mono">
              {computedIssues.length}
            </div>
          </div>

          <ScrollArea className="pr-3 mr-2" id="project-board-list">
            <div className="flex flex-col gap-3 grow pb-10 pt-2">
              {computedIssues.map((issue: IssueType, index: number) => (
                <BoardItem key={issue.id} id={issue.id}>
                  <Draggable
                    key={issue.id}
                    draggableId={issue.id}
                    index={index}
                  >
                    {(
                      dragProvided: DraggableProvided,
                      dragSnapshot: DraggableStateSnapshot,
                    ) => {
                      return (
                        <BoardIssueItem
                          issueId={issue.id}
                          isDragging={dragSnapshot.isDragging}
                          provided={dragProvided}
                        />
                      );
                    }}
                  </Draggable>
                </BoardItem>
              ))}
            </div>
          </ScrollArea>
        </div>
      </BoardColumn>
    );
  },
);

export const NoProjectView = observer(() => {
  const { issuesStore } = useContextStore();
  const team = useCurrentTeam();
  const { workflows } = useComputedWorkflows();
  const cycle = useCycle();

  const issues = issuesStore.getIssuesForNoProject({
    teamId: team?.id,
    cycleId: cycle?.id,
  });

  const computedIssues = useFilterIssues(issues, workflows);

  if (computedIssues.length === 0) {
    return null;
  }

  return (
    <BoardColumn key="no-user" id="no-user">
      <div className="flex flex-col max-h-[100%]">
        <div className="flex gap-1 items-center mb-2">
          <div className="flex items-center w-fit h-8 rounded-2xl px-4 py-2 bg-grayAlpha-100">
            <Project size={20} />
            <h3 className="pl-2">No Project</h3>
          </div>

          <div className="rounded-2xl bg-grayAlpha-100 p-1.5 px-2 font-mono">
            {computedIssues.length}
          </div>
        </div>

        <ScrollArea className="pr-3 mr-2" id="no-project-board-list">
          <div className="flex flex-col gap-3 grow pb-10 pt-2">
            {computedIssues.map((issue: IssueType, index: number) => (
              <BoardItem key={issue.id} id={issue.id}>
                <Draggable key={issue.id} draggableId={issue.id} index={index}>
                  {(
                    dragProvided: DraggableProvided,
                    dragSnapshot: DraggableStateSnapshot,
                  ) => (
                    <BoardIssueItem
                      issueId={issue.id}
                      isDragging={dragSnapshot.isDragging}
                      provided={dragProvided}
                    />
                  )}
                </Draggable>
              </BoardItem>
            ))}
          </div>
        </ScrollArea>
      </div>
    </BoardColumn>
  );
});
