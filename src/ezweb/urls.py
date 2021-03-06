# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#

from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('ezweb.views',
    (r'^$', 'select_workspace'),
    (r'^lite$', 'select_workspace', {'mode': 'lite'}),
    url(r'^workspaces/(?P<workspace>\d+)/?$', 'render_workspace_view', name='wirecloud.workspace_view'),

    (r'^viewer/workspace/(?P<public_ws_id>[\d]+)$', 'public_ws_viewer'),

    # Login service
    (r'^interfaces/login/service$', 'redirected_login'),

    # HTML interfaces
    # Create gadget
    (r'^interfaces/gadget$', 'add_gadget_script'),
    # Update gadget
    (r'^interfaces/update_gadget$', 'update_gadget_script')
)
