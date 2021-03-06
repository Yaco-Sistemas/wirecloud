/* 
*     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
*     S.A.Unipersonal (Telefonica I+D)
*
*     This file is part of Morfeo EzWeb Platform.
*
*     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as published by
*     the Free Software Foundation, either version 3 of the License, or
*     (at your option) any later version.
*
*     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
*
*     Info about members and contributors of the MORFEO project
*     is available at
*
*     http://morfeo-project.org
 */

/*jslint white: true, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*global BrowserUtilsFactory, clearTimeout, CookieManager, document, Element, Event, GadgetVersion, gettext, LayoutManagerFactory, OpManagerFactory, setTimeout, ShowcaseFactory */
"use strict";

//////////////////////////
// PARENT COMMAND CLASS
//////////////////////////
var UserCommand = function (dom_element, html_event, services, dom_wrapper, data, policy) {
    this.html_event = html_event;
    this.dom_element = dom_element;
    this.services = services;
    this.dom_wrapper = dom_wrapper;
    this.data = data;

    this.anonymous_function = this.anonymous_function.bind(this);

    if (this.dom_element) {
        Event.observe(this.dom_element, this.html_event, this.anonymous_function, false, policy);
    }

    this.set_catalogue = function (catalogue) {
        this.catalogue = catalogue;
    };
};

/////////////////////
// GENERAL COMMANDS
////////////////////

var ViewAllCommand  = function (dom_element, html_event, service_facade, dom_wrapper) {
    this.anonymous_function =  function (event) {
        this.services.search('VIEW_ALL', 1, 'AND', 'gadget');
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, null);
};

/////////////////////////////////
// COMMANDS WITH ATTACHED DATA
/////////////////////////////////

var SimpleSearchCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this._anonymous_function = function () {
        this.services.search('SIMPLE_SEARCH',
            this.data.starting_page,
            this.data.boolean_operator,
            this.data.scope,
            this.data.criteria);
    };

    this.anonymous_function = function (event) {

        switch (event.keyCode) {
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
            return;

        case 13: // enter

            // Cancel current timeout
            if (this.timeout !== null) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            // Inmediate search
            this._anonymous_function();

            // Don't set a new timeout
            return;

        default:
            // Cancel current timeout
            if (this.timeout !== null) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }

        this.timeout = setTimeout(this._anonymous_function.bind(this), 700);
    };

    this.timeout = null;
    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data);
};

var InstantiateCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this.anonymous_function = function (event) {
        var resource = this.data;

        //is mashup?
        if (resource.isMashup()) {
            LayoutManagerFactory.getInstance().showWindowMenu(
                "addMashup",
                function () {
                    OpManagerFactory.getInstance().addMashupResource(this);
                }.bind(resource),
                function () {
                    OpManagerFactory.getInstance().mergeMashupResource(this);
                }.bind(resource));

            return;
        }

        // Normal instantiation!
        ShowcaseFactory.getInstance().addGadget(resource.getVendor(), resource.getName(),
            resource.getVersion().text, resource.getUriTemplate());
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var ShowWindowCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this.anonymous_function = function (event) {
        var window_name = this.data.window;

        LayoutManagerFactory.getInstance().showWindowMenu(window_name);
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var ShowResourceDetailsCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this.anonymous_function = function (event) {
        var response_command = this.services.create_local_command('PAINT_RESOURCE_DETAILS', data);

        response_command.process();
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var ShowToolbarSectionCommand = function (dom_element, html_event, service_facade, dom_wrapper, data) {
    this.anonymous_function = function (event) {
        var command_id, search_scope, response_command;
        command_id = data;
        search_scope = this.services.searcher.get_scope();

        response_command = this.services.create_local_command(command_id, search_scope);
        response_command.process();
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data);
};

var ShowTabCommand = function (dom_element, html_event, service_facade, dom_wrapper, data) {
    this.anonymous_function = function (event) {
        var command_id, search_scope, initialized_scope, response_command;

        command_id = data;
        search_scope = null;
        initialized_scope = true;

        if (command_id === 'SHOW_GADGETS') {
            search_scope = 'gadget';
        } else if (command_id === 'SHOW_MASHUPS') {
            search_scope = 'mashup';
        }

        if (search_scope) {
            initialized_scope = this.services.searcher.set_scope(search_scope);
        }

        if (initialized_scope) {
            response_command = this.services.create_local_command(command_id, null);

            response_command.process();
        } else {
            // Not initialized environment! => Searching for text in search_input!
            this.services.search('SIMPLE_SEARCH', 1, 'AND');
        }
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data);
};

var SubmitGadgetCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this.anonymous_function = function (event) {
        this.services.submit_gadget_to_catalogue(this.data);
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var DeleteResourceCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this.anonymous_function = function (event) {
        this.services.delete_resource(this.data);
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var UpdateResourceHTMLCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this.anonymous_function = function (event) {
        this.services.update_resource_html(this.data);
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var TagResourceCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    var submit_tag_to_resource;

    this.anonymous_function = function (event) {
        var target = BrowserUtilsFactory.getInstance().getTarget(event),
            tagging_area_div = target.nextSiblings()[0],
            submit_tag_link;

        tagging_area_div.toggleClassName('hidden');

        if (!tagging_area_div.binded_events) {
            this.tag_input = tagging_area_div.getElementsBySelector('.tag_input')[0];
            submit_tag_link = tagging_area_div.getElementsBySelector('.submit_tag_link')[0];

            Event.observe(submit_tag_link, 'click', submit_tag_to_resource.bind(this));
            Event.observe(this.tag_input, 'keypress', submit_tag_to_resource.bind(this));

            tagging_area_div.binded_events = true;
        }
    };

    submit_tag_to_resource = function (event) {
        if (event.type === 'click' || event.keyCode === 13) {
            this.services.tag(this.data, this.tag_input.value);
        }
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var RemoveResourceTagCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this.anonymous_function = function (event) {
        var target = BrowserUtilsFactory.getInstance().getTarget(event),
            tag_id = target.tag_id;

        this.services.delete_tag(this.data, tag_id);
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var VoteResourceCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    var bind_popularity_events, mark_previous_stars, commit_voting, unmark_not_committed_stars;

    this.anonymous_function = function (event) {
        var target, operation_area_div, popularity_div;

        target = BrowserUtilsFactory.getInstance().getTarget(event);
        operation_area_div = target.nextSiblings()[0];
        popularity_div = operation_area_div.getElementsBySelector('.popularity')[0];

        operation_area_div.toggleClassName('hidden');

        if (!popularity_div.binded_events) {
            bind_popularity_events(popularity_div, this);

            popularity_div.binded_events = true;
        }
    };

    bind_popularity_events = function (popularity_div, vote_command) {
        var i, user_vote, vote_stars, vote_star;

        user_vote = vote_command.data.getUserVote();
        vote_stars = popularity_div.childElements();

        for (i = 0.0; i < vote_stars.length; i += 1) {
            vote_star = vote_stars[i];

            if (user_vote > i) {
                vote_star.addClassName('on');
            }

            Event.observe(vote_star, 'mouseover', mark_previous_stars);
            Event.observe(vote_star, 'click', commit_voting.bind(vote_command));
        }

        Event.observe(popularity_div, 'mouseout', unmark_not_committed_stars);
    };

    mark_previous_stars = function (event) {
        var target, previous_sibling;
        
        target = BrowserUtilsFactory.getInstance().getTarget(event);
        target.addClassName('on');

        previous_sibling = target.previousElementSibling;

        while (previous_sibling) {
            previous_sibling.addClassName('on');

            previous_sibling = previous_sibling.previousElementSibling;
        }
    };

    commit_voting = function (event) {
        var target = BrowserUtilsFactory.getInstance().getTarget(event),
            vote = target.previousSiblings().length + 1;

        target.parentNode.committed_voting = target;

        mark_previous_stars(event);
        unmark_not_committed_stars(event);

        this.services.vote(this.data, vote);
    };

    unmark_not_committed_stars = function (event) {
        var target = BrowserUtilsFactory.getInstance().getTarget(event),
            stars_container = target.parentNode,
            next_sibling = null;

        if (stars_container.committed_voting) {
            next_sibling = stars_container.committed_voting.nextElementSibling;
        } else {
            next_sibling = target.parentNode.firstElementChild;
        }

        while (next_sibling) {
            next_sibling.removeClassName('on');

            next_sibling = next_sibling.nextElementSibling;
        }
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var ChangeResourceVersionCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {
    this.anonymous_function = function (event) {
        var target, operation_area_div, versions_area_div, resource,
            resource_versions, html_versions, preferred_versions,
            preferred_version, i, preferred_version_written,
            preferred_version_obj, key, result, current_version;

        target = BrowserUtilsFactory.getInstance().getTarget(event);
        operation_area_div = target.nextSiblings()[0];
        versions_area_div = operation_area_div.getElementsBySelector('.operation_content')[0];

        operation_area_div.toggleClassName('hidden');

        resource = this.data;
        resource_versions = resource.getAllVersions();
        html_versions = '';

        versions_area_div.update('');

        preferred_versions = CookieManager.readCookie('preferred_versions', true);
        preferred_version = '';
        if (preferred_versions !== null) {
            key = resource.getVendor() + '/' + resource.getName();
            if (key in preferred_versions) {
                preferred_version = preferred_versions[key];
            }
        }
        this._addVersionLink(versions_area_div, '', preferred_version);
        preferred_version_written = preferred_version === '';
        if (preferred_version !== '') {
            preferred_version_obj = new GadgetVersion(preferred_version);
        }

        for (i = 0; i < resource_versions.length; i += 1) {
            current_version = resource_versions[i];
            if (!preferred_version_written) {
                result = current_version.compareTo(preferred_version_obj);
                if (result === 0) {
                    preferred_version_written = true;
                } else if (result < 0) {
                    this._addVersionLink(versions_area_div, preferred_version_obj, preferred_version, true);
                    preferred_version_written = true;
                }
            }
            this._addVersionLink(versions_area_div, current_version, preferred_version);
        }
    };

    var mark_as_preferred_version = function (event) {
        var target, resource;

        target = BrowserUtilsFactory.getInstance().getTarget(event);
        resource = this.data;

        this.services.change_preferred_version(resource, target.version_code);
    }.bind(this);

    this._addVersionLink = function (div, version, preferred_version, unavailable) {
        var element_tag, element, version_str;

        if (version instanceof GadgetVersion) {
            version_str = version.text;
        } else {
            version_str = version;
        }

        if (version_str === preferred_version) {
            element_tag = 'div';
        } else {
            element_tag = 'a';
        }

        element = document.createElement(element_tag);
        element = Element.extend(element);
        element.addClassName('available_version');

        element.version_code = version;

        if (version_str === preferred_version) {
            element.addClassName('bold');
        } else {
            Event.observe(element, 'click', mark_as_preferred_version);
        }

        if (version_str === '') {
            element.setTextContent(gettext('latest'));
        } else {
            element.setTextContent('v' + version.text);
        }

        div.appendChild(element);
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};

var ShowResourceListCommand = function (dom_element, html_event, service_facade, dom_wrapper, data) {
    this.anonymous_function = function (event) {
        var resource = this.data,
            type_of_resource = '',
            response_command;

        if (resource.isMashup()) {
            type_of_resource = 'SHOW_MASHUPS';
        } else {
            type_of_resource = 'SHOW_GADGETS';
        }

        response_command = this.services.create_local_command(type_of_resource, data);

        response_command.process();
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data);
};

var SubmitPackagedGadgetCommand = function (dom_element, html_event, service_facade, dom_wrapper, data, policy) {

    this.anonymous_function = function (event) {
        this.services.submit_packaged_gadget_to_catalogue(this.data);
    };

    UserCommand.call(this, dom_element, html_event, service_facade, dom_wrapper, data, policy);
};
