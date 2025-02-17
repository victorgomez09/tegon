import { Button } from '@tegonhq/ui/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@tegonhq/ui/components/collapsible';
import { AddLine, ChevronDown, ChevronRight } from '@tegonhq/ui/icons';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { IssueListItem } from 'modules/issues/components';
import { useNewIssue } from 'modules/issues/new-issue';

import { getWorkflowColor } from 'common/status-color';
import type { WorkflowType } from 'common/types';
import type { IssueType } from 'common/types';
import { getWorkflowIcon } from 'common/workflow-icons';

import { useCycle } from 'hooks/cycles';
import { useProject } from 'hooks/projects';

import { useContextStore } from 'store/global-context-provider';

import { useFilterIssues } from '../../../../issues-utils';

interface CategoryViewListProps {
  workflow: WorkflowType;
  workflows: WorkflowType[];
}

export const CategoryViewList = observer(
  ({ workflow, workflows }: CategoryViewListProps) => {
    const CategoryIcon = getWorkflowIcon(workflow);
    const [isOpen, setIsOpen] = React.useState(true);
    const { issuesStore, applicationStore } = useContextStore();
    const project = useProject();
    const cycle = useCycle();
    const { openNewIssue } = useNewIssue();

    const issues = issuesStore.getIssuesForState(workflow.ids, {
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
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex flex-col gap-2"
      >
        <div className="flex gap-1 items-center">
          <CollapsibleTrigger asChild>
            <Button
              className="flex items-center group ml-4 w-fit rounded-2xl text-accent-foreground"
              size="lg"
              style={{ backgroundColor: getWorkflowColor(workflow).background }}
              variant="ghost"
            >
              <CategoryIcon size={20} className="h-5 w-5 group-hover:hidden" />
              <div className="hidden group-hover:block">
                {isOpen ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>
              <h3 className="pl-2">{workflow.name}</h3>
            </Button>
          </CollapsibleTrigger>

          <div className="rounded-2xl bg-grayAlpha-100 p-1.5 px-2 font-mono">
            {computedIssues.length}
          </div>

          <Button
            variant="ghost"
            onClick={() => openNewIssue({ stateId: workflow.id })}
          >
            <AddLine size={14} />
          </Button>
        </div>

        <CollapsibleContent>
          {computedIssues.map((issue: IssueType) => (
            <IssueListItem key={issue.id} issueId={issue.id} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  },
);
